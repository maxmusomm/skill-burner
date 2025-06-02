"use client";
import React, { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import { signOut } from "next-auth/react";
import { useSession } from "next-auth/react";

export default function SkillBurnPage() {
  const { data: session, status } = useSession();
  const [socket, setSocket] = useState(null);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]); // State for chat messages
  const [documentsStored, setDocumentsStored] = useState(null); // State for document storage notification
  const [userStats, setUserStats] = useState(null); // State for user statistics
  const [showStats, setShowStats] = useState(false); // Toggle for stats panel
  const textareaRef = useRef(null);
  const messagesEndRef = useRef(null); // Ref for scrolling to bottom
  const [sessionCreationAttemptedForAuthId, setSessionCreationAttemptedForAuthId] = useState(null); // New state

  // Fetch user statistics
  const fetchUserStats = async () => {
    try {
      const response = await fetch('/api/documents');
      if (response.ok) {
        const data = await response.json();
        setUserStats(data.stats);
      }
    } catch (error) {
      console.error('Error fetching user stats:', error);
    }
  };

  useEffect(() => {
    // Fetch stats when session is available
    if (session) {
      fetchUserStats();
    }
  }, [session]);

  useEffect(() => {
    // Initialize socket connection
    const newSocket = io("http://localhost:9000");
    setSocket(newSocket);

    newSocket.on("connect", () => {
      console.log("Connected to Socket.IO server:", newSocket.id);

      // Send user authentication data if session exists
      // This initial emission of user_authenticated might be redundant due to the second useEffect
      // but can be kept for immediate auth on fresh connect if session is already present.
      if (status === 'authenticated' && session?.user) {
        const userData = {
          email: session.user.email,
          name: session.user.name,
          image: session.user.image,
        };
        console.log("Sending user authentication data on connect:", userData);
        newSocket.emit("user_authenticated", userData);
      }
    });

    newSocket.on('user_processed', (response) => {
      if (response.success) {
        console.log("User processed successfully:", response.user);
        // Now that user is processed, attempt to create the app session if conditions are met.
        // The main logic for this is now more tightly controlled in the second useEffect.
        // However, we can trigger the session creation attempt here if the session ID is available
        // and hasn't been attempted yet for this auth ID.
        if (status === 'authenticated' && session?.user?.id && sessionCreationAttemptedForAuthId !== session.user.id) {
          const sessionData = {
            sessionId: session.user.id // Using the session-specific ID from NextAuth
          };
          console.log("Creating session with ID (after user_processed):", sessionData.sessionId);
          newSocket.emit("create_session", sessionData);
          // setSessionCreationAttemptedForAuthId(sessionData.sessionId); // Mark as attempted
        }
      } else {
        console.error("Error processing user:", response.error);
      }
    });

    newSocket.on('session_created', (response) => {
      console.log("Session created successfully:", response.session);
      console.log("Existing messages for session:", response.messages);
      setMessages(response.messages || []); // Load existing messages
      // Confirm session creation for this auth ID
      if (session?.user?.id) {
        setSessionCreationAttemptedForAuthId(session.user.id);
      }
    });

    newSocket.on('session_error', (response) => {
      console.error("Session error:", response.error);
      // Optionally, reset sessionCreationAttemptedForAuthId to allow a retry,
      // or display an error to the user. For now, we'll keep it marked to avoid loops.
      // If the error is "User not authenticated", it implies user_processed hasn't completed
      // or currentUser is null on server.
    });

    newSocket.on('initial_messages', (initialMessages) => {
      console.log("Received initial messages:", initialMessages);
      setMessages(initialMessages);
    });

    newSocket.on('new_message', (newMessage) => {
      console.log("Received new message:", newMessage);
      setMessages(prevMessages => [...prevMessages, newMessage]);
    });

    newSocket.on('documents_stored', (data) => {
      console.log("Documents stored:", data);
      setDocumentsStored(data);
      // Refresh user stats when documents are stored
      fetchUserStats();
      // Auto-hide notification after 5 seconds
      setTimeout(() => setDocumentsStored(null), 5000);
    });

    newSocket.on("error_response", (error) => {
      console.error("Error from server:", error);
      // Error messages are now handled through 'new_message' event from server
      // No need to manually add error messages here anymore
    });

    // Cleanup on component unmount
    return () => {
      newSocket.disconnect();
    };
  }, []); // Removed session from dependency array, socket init should be once.

  // Effect for handling NextAuth.js session changes (login/logout)
  useEffect(() => {
    if (socket) {
      if (status === 'authenticated' && session?.user) {
        // User is authenticated
        console.log("NextAuth session is authenticated:", session.user);
        const userData = {
          email: session.user.email,
          name: session.user.name,
          image: session.user.image,
        };
        console.log("Sending user_authenticated (auth status change):", userData);
        socket.emit("user_authenticated", userData);

        // Attempt to create app session if not already attempted for this auth ID
        if (session.user.id && sessionCreationAttemptedForAuthId !== session.user.id) {
          console.log("Attempting to create app session for NextAuth sessionId (auth status change):", session.user.id);
          socket.emit("create_session", { sessionId: session.user.id });
          // Optimistically set, or wait for 'session_created' / 'session_error'
          // setSessionCreationAttemptedForAuthId(session.user.id); // Let 'session_created' handle this
        }
      } else if (status === 'unauthenticated') {
        // User logged out
        console.log("NextAuth session is unauthenticated. Resetting client state.");
        setMessages([]);
        setAppSession(null); // Assuming you have an appSession state
        setSessionCreationAttemptedForAuthId(null); // Reset for next login
        // Optionally, inform the server about logout if needed
      }
    }
  }, [socket, session, status, sessionCreationAttemptedForAuthId]); // Added sessionCreationAttemptedForAuthId

  // Remove the redundant useEffect that was also emitting user_authenticated
  // useEffect(() => {
  //   if (socket && session?.user) {
  //     const userData = {
  //       email: session.user.email,
  //       name: session.user.name,
  //       image: session.user.image,
  //     };
  //     console.log("Sending user authentication data (session change):", userData);
  //     socket.emit("user_authenticated", userData);
  //   }
  // }, [socket, session]); // THIS BLOCK IS REMOVED / COMMENTED OUT

  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) {
      return;
    }

    const resizeTextarea = () => {
      textarea.style.height = "auto"; // Reset height to recalculate
      textarea.style.height = `${textarea.scrollHeight}px`; // Set height to scrollHeight
    };

    // Add event listener
    textarea.addEventListener("input", resizeTextarea);

    // Initial resize
    resizeTextarea();

    // Cleanup event listener on component unmount
    return () => {
      textarea.removeEventListener("input", resizeTextarea);
    };
  }, []); // Empty dependency array means this effect runs once on mount and cleanup on unmount

  // Scroll to bottom of messages when new messages are added
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = () => {
    if (socket && message.trim()) {
      // const userMsg = { id: Date.now(), text: message.trim(), sender: "user" };
      // setMessages(prevMessages => [...prevMessages, userMsg]); // Message will be added via 'new_message' event from server
      socket.emit("send_message", { message: message.trim() });
      setMessage(""); // Clear the input field
      if (textareaRef.current) {
        textareaRef.current.value = ""; // Clear the textarea directly
        // Optionally, trigger resize after clearing
        const textarea = textareaRef.current;
        textarea.style.height = "auto";
        textarea.style.height = `${textarea.scrollHeight}px`;
      }
    }
  };

  const handleInputChange = (e) => {
    setMessage(e.target.value);
    // The existing input event listener will handle resize
  };

  return (
    <div
      className="relative flex size-full min-h-screen flex-col bg-[#111418] dark group/design-root overflow-x-hidden"
      style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Oxygen", "Ubuntu", "Cantarell", sans-serif' }}
    >
      {/* Document Storage Notification */}
      {documentsStored && (
        <div className="fixed top-4 right-4 z-50 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-3">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          <span>{documentsStored.count} documents stored successfully!</span>
          <button
            onClick={() => setDocumentsStored(null)}
            className="ml-2 hover:bg-green-700 rounded p-1"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      )}

      <div className="layout-container flex h-full grow flex-col">
        <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-b-[#293038] px-10 py-3">
          <div className="flex items-center gap-4 text-white">
            <div className="size-4">
              <svg
                viewBox="0 0 48 48"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M24 4C25.7818 14.2173 33.7827 22.2182 44 24C33.7827 25.7818 25.7818 33.7827 24 44C22.2182 33.7827 14.2173 25.7818 4 24C14.2173 22.2182 22.2182 14.2173 24 4Z"
                  fill="currentColor"
                ></path>
              </svg>
            </div>
            <h2 className="text-white text-lg font-bold leading-tight tracking-[-0.015em]">
              SkillUp
            </h2>
          </div>
          <div className="flex flex-1 justify-end gap-8">
            {session ? (
              <>
                {/* User Stats Button */}
                <button
                  onClick={() => setShowStats(!showStats)}
                  className="flex max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-10 bg-[#293038] text-white gap-2 text-sm font-bold leading-normal tracking-[0.015em] min-w-0 px-2.5"
                >
                  <div className="text-white">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20px" height="20px" fill="currentColor" viewBox="0 0 256 256">
                      <path d="M224,128a8,8,0,0,1-8,8H40a8,8,0,0,1,0-16H216A8,8,0,0,1,224,128ZM40,72H216a8,8,0,0,0,0-16H40a8,8,0,0,0,0,16ZM216,184H40a8,8,0,0,0,0,16H216a8,8,0,0,0,0-16Z" />
                    </svg>
                  </div>
                </button>

                {/* User Profile */}
                <div
                  className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10 cursor-pointer"
                  style={{ backgroundImage: `url("${session.user?.image}")` }}
                  onClick={() => signOut()}
                  title={`Sign out ${session.user?.name}`}
                />
              </>
            ) : (
              <button
                onClick={() => window.location.href = '/login'}
                className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-10 px-4 bg-[#1978e5] text-white text-sm font-bold leading-normal tracking-[0.015em]"
              >
                <span className="truncate">Sign In</span>
              </button>
            )}
          </div>
        </header>

        {/* User Statistics Panel */}
        {showStats && userStats && (
          <div className="mx-4 sm:mx-10 md:mx-20 lg:mx-40 mt-4 bg-[#293038] rounded-lg p-6 border border-[#3c4753]">
            <h3 className="text-white text-lg font-bold mb-4 flex items-center gap-2">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
              </svg>
              Your Learning Statistics
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-[#111418] p-4 rounded-lg">
                <div className="text-2xl font-bold text-green-400">{userStats.totalDocuments || 0}</div>
                <div className="text-sm text-gray-300">Documents Created</div>
              </div>
              <div className="bg-[#111418] p-4 rounded-lg">
                <div className="text-2xl font-bold text-blue-400">{userStats.totalSessions || 0}</div>
                <div className="text-sm text-gray-300">Learning Sessions</div>
              </div>
              <div className="bg-[#111418] p-4 rounded-lg">
                <div className="text-2xl font-bold text-purple-400">
                  {userStats.firstDocument ?
                    Math.ceil((new Date() - new Date(userStats.firstDocument)) / (1000 * 60 * 60 * 24)) : 0}
                </div>
                <div className="text-sm text-gray-300">Days Learning</div>
              </div>
              <div className="bg-[#111418] p-4 rounded-lg">
                <div className="text-2xl font-bold text-yellow-400">
                  {userStats.lastDocument ?
                    `${Math.floor((new Date() - new Date(userStats.lastDocument)) / (1000 * 60 * 60))}h` : 'N/A'}
                </div>
                <div className="text-sm text-gray-300">Last Activity</div>
              </div>
            </div>

            {userStats.totalDocuments > 0 && (
              <div className="mt-4 p-4 bg-[#111418] rounded-lg">
                <h4 className="text-white font-semibold mb-2">Quick Facts</h4>
                <div className="text-sm text-gray-300 space-y-1">
                  <p>• First document created: {userStats.firstDocument ? new Date(userStats.firstDocument).toLocaleDateString() : 'N/A'}</p>
                  <p>• Most recent activity: {userStats.lastDocument ? new Date(userStats.lastDocument).toLocaleDateString() : 'N/A'}</p>
                  <p>• Average documents per session: {userStats.totalSessions > 0 ? (userStats.totalDocuments / userStats.totalSessions).toFixed(1) : '0'}</p>
                </div>
              </div>
            )}

            <button
              onClick={() => setShowStats(false)}
              className="mt-4 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg text-sm transition-colors duration-200"
            >
              Close Stats
            </button>
          </div>
        )}

        <div className="px-40 flex flex-1 justify-center py-5">
          <div className="layout-content-container flex flex-col max-w-[960px] flex-1">
            <div className="flex flex-wrap justify-between gap-3 p-4">
              <p className="text-white tracking-light text-[32px] font-bold leading-tight min-w-72">
                SkillUp Agent
              </p>
            </div>

            {/* Message display area */}
            <div className="flex-grow overflow-y-auto space-y-3 min-h-[300px]">
              {messages.length === 0 ? (
                // Welcome message when no messages
                <div className="flex gap-3 p-4">
                  <div className="flex flex-1 flex-col items-stretch gap-2">
                    <div className="flex flex-col gap-1">
                      <p className="text-white text-base font-bold leading-tight">Agent</p>
                      <p className="text-white text-base font-normal leading-normal">
                        Hi there! I'm here to help you create a personalized skill course. What skills are you interested in learning or improving?
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                messages.map((msg) => (
                  <div key={msg.id} className="flex gap-3 p-4">
                    <div className="flex flex-1 flex-col items-stretch gap-2">
                      <div className="flex flex-col gap-1">
                        <p className="text-white text-base font-bold leading-tight">
                          {msg.sender === 'user' ? 'User' : 'Agent'}
                        </p>
                        <p className={`text-white text-base font-normal leading-normal whitespace-pre-wrap ${msg.isError ? 'text-red-400' : ''
                          }`}>
                          {msg.text}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="flex max-w-full w-full flex-wrap items-end gap-4 px-4 py-3">
              <label className="flex flex-col min-w-40 flex-1">
                <textarea
                  id="message-input"
                  ref={textareaRef}
                  placeholder="Type your message..."
                  value={message}
                  onChange={handleInputChange}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  className="form-input resize-none flex w-full min-w-0 flex-1 overflow-hidden rounded-xl text-white focus:outline-0 focus:ring-0 border border-[#3c4753] bg-[#1c2126] focus:border-[#3c4753] h-14 placeholder:text-[#9daab8] p-[15px] text-base font-normal leading-normal"
                  rows={1}
                />
              </label>
              <button
                onClick={handleSendMessage}
                className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-14 px-6 bg-[#1978e5] text-white text-sm font-bold leading-normal tracking-[0.015em]"
              >
                <span className="truncate">Send</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
