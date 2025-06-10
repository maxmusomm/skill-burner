"use client";
import React, { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import { signOut } from "next-auth/react";
import { useSession } from "next-auth/react";
import Sidebar from "./components/Sidebar";
import PdfViewerDialog from "@/components/pdf-viewer-dialog";

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
  const [currentSessionId, setCurrentSessionId] = useState(null); // Track current session ID
  const [existingSessions, setExistingSessions] = useState([]); // Track user's existing sessions
  const [showSessionSelector, setShowSessionSelector] = useState(false); // Toggle for session selector
  const [userPdfs, setUserPdfs] = useState([]); // Track user's PDFs
  const [pdfDialogOpen, setPdfDialogOpen] = useState(false); // State for dialog
  const [showPdfs, setShowPdfs] = useState(false); // Toggle for PDF dropdown
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const sidebarWidth = 320; // Corresponds to w-80 in Tailwind CSS (80 * 4px)

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

  // Fetch user PDFs
  const fetchUserPdfs = async (sessionId = null) => {
    try {
      let url = '/api/pdfs';
      if (sessionId) {
        url += `?sessionId=${sessionId}`;
      }

      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setUserPdfs(data.pdfs);
        }
      }
    } catch (error) {
      console.error('Error fetching user PDFs:', error);
    }
  };

  // Download PDF
  const downloadPdf = async (fileId, filename) => {
    try {
      const response = await fetch(`/api/pdfs/${fileId}`);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        console.error('Failed to download PDF');
      }
    } catch (error) {
      console.error('Error downloading PDF:', error);
    }
  };

  useEffect(() => {
    // Fetch stats and PDFs when session is available
    if (session) {
      fetchUserStats();
      fetchUserPdfs(currentSessionId);
    }
  }, [session, currentSessionId]);

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
        console.log("Existing sessions:", response.existingSessions);
        setExistingSessions(response.existingSessions || []);
        // Don't automatically create a session anymore - user will choose
      } else {
        console.error("Error processing user:", response.error);
      }
    });

    newSocket.on('session_created', (response) => {
      console.log("Session created successfully:", response.session);
      console.log("Existing messages for session:", response.messages);
      setMessages(response.messages || []); // Load existing messages
      setCurrentSessionId(response.session.sessionId);
      setShowSessionSelector(false); // Hide session selector after creating session
    });

    newSocket.on('session_joined', (response) => {
      if (response.session) {
        console.log("Session joined successfully:", response.session);
        console.log("Existing messages for session:", response.messages);
        setMessages(response.messages || []); // Load existing messages
        setCurrentSessionId(response.session.sessionId);
        setShowSessionSelector(false); // Hide session selector after joining session
      } else {
        console.error("Error joining session: Invalid response format", response);
      }
    });

    newSocket.on('session_error', (response) => {
      console.error("Session error:", response.error);
      // Could show error message to user here
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
      // Refresh PDFs for current session when documents are stored
      fetchUserPdfs(currentSessionId);
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

        // Session creation will be handled in user_processed event
      } else if (status === 'unauthenticated') {
        // User logged out
        console.log("NextAuth session is unauthenticated. Resetting client state.");
        setMessages([]);
        setCurrentSessionId(null);
        setExistingSessions([]);
        setShowSessionSelector(false);
        // Optionally, inform the server about logout if needed
      }
    }
  }, [socket, session, status]); // Removed sessionCreationAttemptedForAuthId

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
    if (socket && message.trim() && currentSessionId) {
      socket.emit("send_message", {
        message: message.trim(),
        sessionId: currentSessionId
      });
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

  // Session management functions
  const createNewSession = () => {
    if (socket) {
      console.log("Creating new session...");
      socket.emit("create_session");
      setIsSidebarOpen(false); // Close sidebar when new chat is created
    }
  };

  const joinExistingSession = (sessionId) => {
    if (socket && sessionId) {
      console.log("Joining session:", sessionId);
      socket.emit("join_session", { sessionId });
      setIsSidebarOpen(false); // Close sidebar when session is selected
    }
  };

  const formatSessionDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
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

      {/* Sidebar is now part of the main layout flow for the push animation */}
      {/* The Sidebar component itself will handle its fixed positioning and visibility */}

      {/* Main Layout Container - This will shift based on sidebar state */}
      <div
        className={`flex flex-1 h-full transition-all duration-300 ease-in-out`}
        style={{
          paddingLeft: isSidebarOpen ? `${sidebarWidth}px` : '0px',
        }}
      >
        {/* Sidebar Component */}
        {/* The Sidebar component needs to be aware of its width to correctly offset itself when closed */}
        <Sidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          onNewChatClick={createNewSession}
          width={sidebarWidth} // Pass width to Sidebar
        >
          <div className="p-4">
            <h3 className="text-white text-lg font-semibold mb-4">Your Sessions</h3>
            {existingSessions.length > 0 ? (
              <ul className="space-y-2">
                {existingSessions.map((session) => (
                  <li key={session.sessionId}
                    className="p-3 bg-[#293038] rounded-lg hover:bg-[#3c4753] cursor-pointer transition-colors duration-150"
                    onClick={() => joinExistingSession(session.sessionId)}>
                    <div className="text-sm text-gray-300">
                      Session ID: {session.sessionId.substring(0, 8)}...
                    </div>
                    <div className="text-xs text-gray-400">
                      Created: {formatSessionDate(session.createdAt)}
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-400">No existing sessions. Start a new chat!</p>
            )}
          </div>
        </Sidebar>

        {/* Chat Interface Container - This is what gets "pushed" */}
        <div className="layout-container flex h-full grow flex-col w-full">
          <header className="sticky top-0 z-20 bg-[#111418] flex items-center justify-between whitespace-nowrap border-b border-solid border-b-[#293038] px-4 sm:px-10 py-3">
            {/* Hamburger button is now part of the main content's header */}
            <div className="flex items-center gap-4 text-white">
              <button
                onClick={() => setIsSidebarOpen(true)}
                className={`p-2 hover:bg-[#293038] rounded-lg transition-all duration-300 ease-in-out ${isSidebarOpen ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
                title="Open Sessions"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                </svg>
              </button>

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
                  {/* PDFs Button - Only show when there's an active session */}
                  {currentSessionId && (
                    <div className="relative">
                      <button
                        onClick={() => setPdfDialogOpen(true)}
                        className="flex max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-10 bg-[#293038] text-white gap-2 text-sm font-bold leading-normal tracking-[0.015em] min-w-0 px-2.5"
                        title="View your generated PDFs"
                      >
                        <div className="text-white">
                          <svg xmlns="http://www.w3.org/2000/svg" width="20px" height="20px" fill="currentColor" viewBox="0 0 256 256">
                            <path d="M224,152a8,8,0,0,1-8,8H192v16a8,8,0,0,1-8,8H40a8,8,0,0,1-8-8V56a8,8,0,0,1,8-8H72V32a8,8,0,0,1,8-8H216a8,8,0,0,1,8,8Zm-40-8V48H88V160H184Z" />
                          </svg>
                        </div>
                        {userPdfs.length > 0 && (
                          <span className="bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                            {userPdfs.length}
                          </span>
                        )}
                      </button>

                      {/* PDF Dialog */}
                      <PdfViewerDialog
                        open={pdfDialogOpen}
                        onOpenChange={setPdfDialogOpen}
                        pdfs={userPdfs}
                        onDownloadPdf={downloadPdf}
                      />
                    </div>
                  )}

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

          {/* Main Content Area (Chat messages, input, etc.) */}
          <main className="flex flex-1 flex-col overflow-y-auto bg-[#0b1014]">
            {/* Session Selector */}
            {showSessionSelector && session && (
              <div className="mx-4 sm:mx-10 md:mx-20 lg:mx-40 mt-4 bg-[#293038] rounded-lg p-6 border border-[#3c4753]">
                <h3 className="text-white text-lg font-bold mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                  </svg>
                  Choose a Session
                </h3>

                <div className="mb-4">
                  <button
                    onClick={createNewSession}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[#1978e5] hover:bg-[#1565c0] text-white rounded-lg font-semibold transition-colors duration-200"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                    </svg>
                    Start New Session
                  </button>
                </div>

                {existingSessions.length > 0 && (
                  <>
                    <div className="mb-3">
                      <h4 className="text-white font-semibold text-sm mb-2">Or continue an existing session:</h4>
                    </div>
                    <div className="space-y-2 max-h-60 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800">
                      {existingSessions.map((session) => (
                        <div
                          key={session.sessionId}
                          onClick={() => joinExistingSession(session.sessionId)}
                          className="p-3 bg-[#111418] hover:bg-[#1c2126] rounded-lg cursor-pointer border border-[#3c4753] hover:border-[#1978e5] transition-all duration-200"
                        >
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <div className="text-white font-medium text-sm">
                                Session {session.sessionId.slice(0, 8)}...
                              </div>
                              <div className="text-gray-400 text-xs mt-1">
                                Created: {formatSessionDate(session.createdAt)}
                              </div>
                              {session.lastMessage && (
                                <div className="text-gray-300 text-xs mt-1 truncate">
                                  Last: "{session.lastMessage.slice(0, 50)}..."
                                </div>
                              )}
                            </div>
                            <div className="text-gray-500 text-xs">
                              {session.messageCount || 0} messages
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}

            <div className="px-40 flex flex-1 justify-center py-5">
              <div className="layout-content-container flex flex-col max-w-[960px] flex-1">
                <div className="flex flex-wrap justify-between gap-3 p-4">
                  <p className="text-white tracking-light text-[32px] font-bold leading-tight min-w-72">
                    SkillUp Agent
                  </p>
                  {currentSessionId && (
                    <span className="text-gray-400 text-sm self-center">
                      Session: {currentSessionId.slice(0, 8)}...
                    </span>
                  )}
                </div>

                {currentSessionId ? (
                  <>
                    {/* Message display area */}
                    <div className="flex-grow overflow-y-auto space-y-3 min-h-[300px] max-h-[calc(100vh-300px)] scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800">
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
                  </>
                ) : (
                  /* Welcome screen when no session is selected */
                  <div className="flex-grow flex items-center justify-center">
                    <div className="text-center max-w-md">
                      <svg className="w-16 h-16 mx-auto mb-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                      </svg>
                      <h3 className="text-white text-xl font-semibold mb-2">Welcome to SkillUp!</h3>
                      <p className="text-gray-400 mb-6">
                        {existingSessions.length > 0
                          ? "Choose an existing session to continue or start a new one to begin learning."
                          : "Start your first learning session to get personalized skill recommendations and courses."
                        }
                      </p>
                      <button
                        onClick={() => setShowSessionSelector(true)}
                        className="px-6 py-3 bg-[#1978e5] hover:bg-[#1565c0] text-white rounded-lg font-semibold transition-colors duration-200"
                      >
                        Get Started
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

