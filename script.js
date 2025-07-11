/* DOM elements */
const chatForm = document.getElementById("chatForm");
const userInput = document.getElementById("userInput");
const chatWindow = document.getElementById("chatWindow");
const currentQuestion = document.getElementById("currentQuestion");
const questionText = currentQuestion.querySelector(".question-text");

// L'Oréal-specific system prompt to guide the chatbot
const SYSTEM_PROMPT = `You are a L'Oréal Smart Product Advisor. Your role is to help customers with L'Oréal products, beauty routines, and recommendations. 

Guidelines:
- Only answer questions related to L'Oréal products, beauty, skincare, haircare, and makeup
- Provide helpful product recommendations from L'Oréal's portfolio
- Suggest beauty routines and tips using L'Oréal products
- If asked about non-L'Oréal topics, politely redirect to L'Oréal-related questions
- Be friendly, professional, and knowledgeable about beauty and L'Oréal products
- Keep responses concise and helpful
- Remember the user's name and previous questions to provide personalized advice

If someone asks about topics unrelated to L'Oréal or beauty, respond with: "I'm here to help with L'Oréal products and beauty advice. How can I assist you with your beauty routine or product recommendations?"`;

// Conversation history to maintain context
let conversationHistory = [];

// Set initial message
chatWindow.innerHTML = "";
addMessage(
  "👋 Hello! I'm your L'Oréal Smart Product Advisor. What's your name, and how can I help you today?",
  "ai"
);

/* Handle form submit */
chatForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  // Get user message
  const userMessage = userInput.value.trim();
  if (!userMessage) return;

  // Display current question
  questionText.textContent = userMessage;
  currentQuestion.style.display = "block";

  // Add user message to chat and conversation history
  addMessage(userMessage, "user");
  conversationHistory.push({
    role: "user",
    content: userMessage,
  });

  // Clear input
  userInput.value = "";

  // Show loading message
  const loadingElement = addMessage("Thinking...", "ai");

  try {
    // Prepare messages array with system prompt and conversation history
    const messages = [
      {
        role: "system",
        content: SYSTEM_PROMPT,
      },
      ...conversationHistory, // Include entire conversation history
    ];

    // Call OpenAI API through Cloudflare Worker
    const response = await fetch(
      "https://project-gca-08.rmfrench704.workers.dev/",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gpt-4o",
          messages: messages,
          max_tokens: 500,
          temperature: 0.7,
        }),
      }
    );

    // Check if response is ok
    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }

    // Get the AI response
    const data = await response.json();
    const aiMessage = data.choices[0].message.content;

    // Add AI response to conversation history
    conversationHistory.push({
      role: "assistant",
      content: aiMessage,
    });

    // Remove loading message and add AI response
    loadingElement.remove();
    addMessage(aiMessage, "ai");
  } catch (error) {
    // Remove loading message and show error
    loadingElement.remove();
    addMessage("Sorry, I encountered an error. Please try again.", "ai");
    console.error("Error:", error);
  }
});

/* Function to add messages to chat window */
function addMessage(message, sender) {
  const messageElement = document.createElement("div");
  messageElement.classList.add("msg", sender);

  // Create message bubble
  const bubbleElement = document.createElement("div");
  bubbleElement.classList.add("msg-bubble");
  bubbleElement.textContent = message;

  messageElement.appendChild(bubbleElement);
  chatWindow.appendChild(messageElement);

  // Scroll to bottom
  chatWindow.scrollTop = chatWindow.scrollHeight;

  return messageElement;
}
