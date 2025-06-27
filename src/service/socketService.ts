import { io, Socket } from "socket.io-client";

export interface Message {
  id: string;
  content: string;
  senderId: string;
  receiverId: string;
  isRead: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SendMessageData {
  content: string;
}

export interface MarkAsReadData {
  conversationPartnerId: string;
}

export interface TypingData {
  receiverId: string;
  isTyping: boolean;
}

class SocketService {
  private socket: Socket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 3;
  private reconnectInterval = 2000;
  private isConnecting = false;

  connect(token: string): Promise<void> {
    // Prevent multiple connection attempts
    if (this.isConnecting) {
      return Promise.reject(new Error("Already attempting to connect"));
    }

    // If already connected, resolve immediately
    if (this.socket && this.socket.connected) {
      return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
      this.isConnecting = true;
      // Use the same URL structure as your HTML demo
      const isDevelopment =
        process.env.NODE_ENV === "development" ||
        window.location.hostname === "localhost";
      const SOCKET_URL = isDevelopment
        ? "http://localhost:8080"
        : (
            process.env.REACT_APP_API_URL || "https://twitter-ieea.onrender.com"
          ).replace("/api", "");

      console.log("Attempting to connect to:", SOCKET_URL);

      // Use the same configuration as your HTML demo
      this.socket = io(SOCKET_URL, {
        auth: {
          token: token,
        },
        // Don't force websocket transport - let it negotiate like the HTML demo
        // transports: ['websocket'],
        autoConnect: true,
        forceNew: true,
      });

      this.socket.on("connect", () => {
        console.log("Connected to chat server");
        this.reconnectAttempts = 0;
        this.isConnecting = false;
        resolve();
      });

      this.socket.on("connect_error", (error) => {
        console.error("Connection error:", error);
        this.isConnecting = false;
        reject(error);
      });

      this.socket.on("disconnect", (reason) => {
        console.log("Disconnected from chat server:", reason);
        this.isConnecting = false;
        if (reason === "io server disconnect") {
          // The disconnection was initiated by the server, reconnect manually
          this.handleReconnect();
        }
      });

      this.socket.on("reconnect", () => {
        console.log("Reconnected to chat server");
        this.reconnectAttempts = 0;
        this.isConnecting = false;
      });

      this.socket.on("reconnect_error", (error) => {
        console.error("Reconnection error:", error);
        this.isConnecting = false;
        this.handleReconnect();
      });

      // Set a timeout to reject if connection takes too long (matching HTML demo timeout behavior)
      setTimeout(() => {
        if (this.isConnecting) {
          this.isConnecting = false;
          reject(new Error("Connection timeout"));
        }
      }, 20000); // Increased timeout to 20 seconds like in the demo
    });
  }

  private handleReconnect(): void {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(
        `Attempting to reconnect... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`
      );

      setTimeout(() => {
        if (this.socket) {
          this.socket.connect();
        }
      }, this.reconnectInterval * this.reconnectAttempts);
    } else {
      console.error("Max reconnection attempts reached");
    }
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  sendMessage(
    receiverId: string,
    content: SendMessageData,
    callback?: (response: {
      success: boolean;
      message?: Message;
      error?: string;
    }) => void
  ): void {
    if (!this.socket || !this.socket.connected) {
      console.error("Socket not connected");
      if (callback) {
        callback({ success: false, error: "Socket not connected" });
      }
      return;
    }

    this.socket.emit("sendMessage", receiverId, content, callback);
  }

  markAsRead(
    data: MarkAsReadData,
    callback?: (response: { success: boolean; error?: string }) => void
  ): void {
    if (!this.socket || !this.socket.connected) {
      console.error("Socket not connected");
      if (callback) {
        callback({ success: false, error: "Socket not connected" });
      }
      return;
    }

    this.socket.emit("markAsRead", data, callback);
  }

  sendTypingIndicator(data: TypingData): void {
    if (!this.socket || !this.socket.connected) {
      console.error("Socket not connected");
      return;
    }

    this.socket.emit("typing", data);
  }

  subscribeToMessages(callback: (message: Message) => void): () => void {
    if (!this.socket) {
      console.error("Socket not initialized");
      return () => {};
    }

    // Remove any existing listener first to avoid duplicates
    this.socket.off("messageReceived", callback);
    this.socket.on("messageReceived", callback);
    console.log("Subscribed to messages");

    // Return unsubscribe function
    return () => {
      if (this.socket) {
        this.socket.off("messageReceived", callback);
        console.log("Unsubscribed from messages");
      }
    };
  }

  subscribeToMessagesMarkedAsRead(
    callback: (data: { userId: string; conversationPartnerId: string }) => void
  ): () => void {
    if (!this.socket) {
      console.error("Socket not initialized");
      return () => {};
    }

    // Remove any existing listener first to avoid duplicates
    this.socket.off("messagesMarkedAsRead", callback);
    this.socket.on("messagesMarkedAsRead", callback);
    console.log("Subscribed to messages marked as read");

    // Return unsubscribe function
    return () => {
      if (this.socket) {
        this.socket.off("messagesMarkedAsRead", callback);
        console.log("Unsubscribed from messages marked as read");
      }
    };
  }

  subscribeToTyping(
    callback: (data: { userId: string; isTyping: boolean }) => void
  ): () => void {
    if (!this.socket) {
      console.error("Socket not initialized");
      return () => {};
    }

    // Remove any existing listener first to avoid duplicates
    this.socket.off("userTyping", callback);
    this.socket.on("userTyping", callback);
    console.log("Subscribed to typing indicators");

    // Return unsubscribe function
    return () => {
      if (this.socket) {
        this.socket.off("userTyping", callback);
        console.log("Unsubscribed from typing indicators");
      }
    };
  }

  isConnected(): boolean {
    return this.socket ? this.socket.connected : false;
  }

  isAttemptingConnection(): boolean {
    return this.isConnecting;
  }

  getConnectionStatus(): "connected" | "connecting" | "disconnected" {
    if (!this.socket) return "disconnected";
    if (this.isConnecting) return "connecting";
    if (this.socket.connected) return "connected";
    return "disconnected";
  }
}

// Create singleton instance
const socketService = new SocketService();

export default socketService;
