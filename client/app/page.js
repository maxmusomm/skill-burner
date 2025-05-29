"use client";
import React, { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";

export default function SkillBurnPage() {
  const [socket, setSocket] = useState(null);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]); // State for chat messages
  const textareaRef = useRef(null);
  const messagesEndRef = useRef(null); // Ref for scrolling to bottom

  useEffect(() => {
    // Initialize socket connection
    const newSocket = io("http://localhost:9000");
    setSocket(newSocket);

    newSocket.on("connect", () => {
      console.log("Connected to Socket.IO server:", newSocket.id);
    });

    newSocket.on("receive_response", (responseData) => {
      console.log("Response from server:", responseData);
      let agentText = "Sorry, I could not understand the response.";
      let isError = true;

      // Attempt to extract text from various possible structures
      if (responseData && typeof responseData.text === 'string') {
        agentText = responseData.text;
        isError = false;
      } else if (responseData && responseData.parts && Array.isArray(responseData.parts) && responseData.parts.length > 0 && typeof responseData.parts[0].text === 'string') {
        agentText = responseData.parts[0].text;
        isError = false;
      } else if (typeof responseData === 'string') { // Handle plain string responses
        agentText = responseData;
        isError = false;
      }


      const agentMsg = {
        id: Date.now() + 1, // Ensure unique ID
        text: agentText,
        sender: "agent",
        isError: isError
      };
      setMessages(prevMessages => [...prevMessages, agentMsg]);

      if (isError && !(typeof responseData === 'string')) { // Log if malformed and not a simple string
        console.error("Received malformed or unexpected message structure from server:", responseData);
      }
    });

    newSocket.on("error_response", (error) => {
      console.error("Error from server:", error);
      const errorMsg = {
        id: Date.now(),
        text: error.details || error.error || "An error occurred with the server.",
        sender: "agent",
        isError: true
      };
      setMessages(prevMessages => [...prevMessages, errorMsg]);
    });

    // Cleanup on component unmount
    return () => {
      newSocket.disconnect();
    };
  }, []); // Empty dependency array ensures this runs only once on mount and cleanup on unmount

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
      const userMsg = { id: Date.now(), text: message.trim(), sender: "user" };
      setMessages(prevMessages => [...prevMessages, userMsg]);
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
      className="relative flex size-full min-h-screen flex-col bg-[#122118] dark group/design-root overflow-x-hidden"
      style={{ fontFamily: '"Spline Sans", "Noto Sans", sans-serif' }}
    >
      <div className="layout-container flex h-full grow flex-col">
        <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-b-[#264532] px-10 py-3">
          <div className="flex items-center gap-4 text-white">
            <button className="size-8 flex items-center justify-center rounded-full hover:bg-[#264532] transition-colors duration-200">
              <svg
                viewBox="0 0 48 48"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="size-4"
              >
                <path
                  d="M24 4C25.7818 14.2173 33.7827 22.2182 44 24C33.7827 25.7818 25.7818 33.7827 24 44C22.2182 33.7827 14.2173 25.7818 4 24C14.2173 22.2182 22.2182 14.2173 24 4Z"
                  fill="currentColor"
                ></path>
              </svg>
            </button>
            <h2 className="text-white text-lg font-bold leading-tight tracking-[-0.015em]">
              Skill Burn
            </h2>
          </div>
        </header>
        <div className="px-4 sm:px-10 md:px-20 lg:px-40 flex flex-1 justify-center py-5">
          <div className="layout-content-container flex flex-col max-w-[960px] flex-1">
            <h1 className="text-white tracking-light text-[32px] font-bold leading-tight px-4 text-center pb-3 pt-6">
              Welcome to Skill Burn
            </h1>
            <p className="text-white text-base font-normal leading-normal pb-3 pt-1 px-4 text-center">
              I&apos;m your learning companion, here to help you master new skills.
              Let&apos;s start by exploring what you&apos;re interested in learning
              today.
            </p>

            {/* Message display area */}
            <div className="flex-grow overflow-y-auto p-4 space-y-2 min-h-[200px]">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`rounded-xl p-3 my-2 max-w-[70%] text-white ${msg.sender === 'user'
                    ? 'bg-[#264532] ml-auto'  // User: Darker green, align right
                    : msg.isError
                      ? 'bg-red-700 mr-auto' // Agent Error: Red, align left
                      : 'bg-[#3a634a] mr-auto'  // Agent: Lighter green, align left
                    }`}
                >
                  <p className="text-sm font-normal leading-normal whitespace-pre-wrap">
                    {msg.text}
                  </p>
                </div>
              ))}
              <div ref={messagesEndRef} /> {/* Element to scroll to */}
            </div>

            <div className="flex max-w-[480px] flex-wrap items-end gap-4 px-4 py-3 mx-auto mt-auto w-full">
              <label className="flex flex-col min-w-40 flex-1">
                <div className="flex w-full flex-1 items-stretch rounded-xl">
                  <textarea
                    id="message-input"
                    ref={textareaRef}
                    placeholder="Let's talk"
                    value={message}
                    onChange={handleInputChange}
                    className="form-textarea resize-none flex w-full min-w-0 flex-1 overflow-hidden rounded-xl text-white focus:outline-0 focus:ring-0 border-none bg-[#264532] focus:border-none h-14 placeholder:text-[#96c5a9] p-4 rounded-r-none border-r-0 pr-2 text-base font-normal leading-normal"
                    rows={1}
                  ></textarea>
                  <button
                    onClick={handleSendMessage}
                    className="text-[#96c5a9] flex border-none bg-[#264532] items-center justify-center pr-4 rounded-r-xl border-l-0 px-4 hover:bg-[#3a634a] transition-colors duration-200"
                    data-icon="PaperPlaneRight"
                    data-size="24px"
                    data-weight="regular"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24px"
                      height="24px"
                      fill="currentColor"
                      viewBox="0 0 256 256"
                    >
                      <path
                        d="M223.87,114l-168-95.89A16,16,0,0,0,32.93,37.32l31,90.47a.42.42,0,0,0,0,.1.3.3,0,0,0,0,.1l-31,90.67A16,16,0,0,0,48,240a16.14,16.14,0,0,0,7.92-2.1l167.91-96.05a16,16,0,0,0,.05-27.89ZM48,224l0-.09L78.14,136H136a8,8,0,0,0,0-16H78.22L48.06,32.12,48,32l168,95.83Z"
                      ></path>
                    </svg>
                  </button>
                </div>
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
