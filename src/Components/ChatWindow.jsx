import React, { useState, useEffect, useRef, useMemo } from "react";
import { CiMenuKebab } from "react-icons/ci";
import {
  IoArrowBack,
  IoClose,
  IoCheckmarkDone,
  IoCheckmark,
  IoTrashOutline,
} from "react-icons/io5";
import { LuSendHorizontal } from "react-icons/lu";
import { FiUsers, FiX, FiCheck, FiExternalLink } from "react-icons/fi";
import { HiOutlineUserAdd } from "react-icons/hi";
import { RiCheckboxCircleLine, RiCheckboxCircleFill } from "react-icons/ri";
import { BsEmojiSmile } from "react-icons/bs";
import socket from "../Config/socket";
import notification from "../Config/notification";
import { getMessages, deleteMessage } from "../API/api";
import AddMemberModal from "./Addmembermodal";

// Emoji Data organized by categories
const emojiData = {
  "Smileys & People": [
    "😀", "😃", "😄", "😁", "😆", "😅", "🤣", "😂", "🙂", "🙃",
    "😉", "😊", "😇", "🥰", "😍", "🤩", "😘", "😗", "😚", "😙",
    "🥲", "😋", "😛", "😜", "🤪", "😝", "🤑", "🤗", "🤭", "🤫",
    "🤔", "🤐", "🤨", "😐", "😑", "😶", "😏", "😒", "🙄", "😬",
    "🤥", "😌", "😔", "😪", "🤤", "😴", "😷", "🤒", "🤕", "🤢",
    "🤮", "🤧", "🥵", "🥶", "🥴", "😵", "🤯", "🤠", "🥳", "🥸",
    "😎", "🤓", "🧐", "😕", "😟", "🙁", "😮", "😯", "😲", "😳",
    "🥺", "😦", "😧", "😨", "😰", "😥", "😢", "😭", "😱", "😖",
    "😣", "😞", "😓", "😩", "😫", "🥱", "😤", "😡", "😠", "🤬",
    "👋", "🤚", "🖐️", "✋", "🖖", "👌", "🤌", "🤏", "✌️", "🤞",
    "🤟", "🤘", "🤙", "👈", "👉", "👆", "🖕", "👇", "☝️", "👍",
    "👎", "✊", "👊", "🤛", "🤜", "👏", "🙌", "👐", "🤲", "🙏",
  ],
  "Animals & Nature": [
    "🐶", "🐱", "🐭", "🐹", "🐰", "🦊", "🐻", "🐼", "🐻‍❄️", "🐨",
    "🐯", "🦁", "🐮", "🐷", "🐸", "🐵", "🐔", "🐧", "🐦", "🐤",
    "🦆", "🦅", "🦉", "🦇", "🐺", "🐗", "🐴", "🦄", "🐝", "🐛",
    "🦋", "🐌", "🐞", "🐜", "🪲", "🪳", "🦟", "🦗", "🕷️", "🦂",
    "🐢", "🐍", "🦎", "🦖", "🦕", "🐙", "🦑", "🦐", "🦞", "🦀",
    "🐡", "🐠", "🐟", "🐬", "🐳", "🐋", "🦈", "🐊", "🐅", "🐆",
    "🌸", "💮", "🏵️", "🌹", "🥀", "🌺", "🌻", "🌼", "🌷", "🌱",
    "🪴", "🌲", "🌳", "🌴", "🌵", "🌾", "🌿", "☘️", "🍀", "🍁",
  ],
  "Food & Drink": [
    "🍎", "🍐", "🍊", "🍋", "🍌", "🍉", "🍇", "🍓", "🫐", "🍈",
    "🍒", "🍑", "🥭", "🍍", "🥥", "🥝", "🍅", "🍆", "🥑", "🥦",
    "🥬", "🥒", "🌶️", "🫑", "🌽", "🥕", "🫒", "🧄", "🧅", "🥔",
    "🍠", "🥐", "🥯", "🍞", "🥖", "🥨", "🧀", "🥚", "🍳", "🧈",
    "🥞", "🧇", "🥓", "🥩", "🍗", "🍖", "🦴", "🌭", "🍔", "🍟",
    "🍕", "🫓", "🥪", "🥙", "🧆", "🌮", "🌯", "🫔", "🥗", "🥘",
    "🍝", "🍜", "🍲", "🍛", "🍣", "🍱", "🥟", "🦪", "🍤", "🍙",
    "☕", "🍵", "🧃", "🥤", "🧋", "🍶", "🍺", "🍻", "🥂", "🍷",
  ],
  Activities: [
    "⚽", "🏀", "🏈", "⚾", "🥎", "🎾", "🏐", "🏉", "🥏", "🎱",
    "🪀", "🏓", "🏸", "🏒", "🏑", "🥍", "🏏", "🪃", "🥅", "⛳",
    "🪁", "🏹", "🎣", "🤿", "🥊", "🥋", "🎽", "🛹", "🛼", "🛷",
    "⛸️", "🥌", "🎿", "⛷️", "🏂", "🪂", "🏋️", "🤼", "🤸", "🤺",
    "⛹️", "🤾", "🏌️", "🏇", "🧘", "🏄", "🏊", "🤽", "🚣", "🧗",
    "🎪", "🎭", "🎨", "🎬", "🎤", "🎧", "🎼", "🎹", "🥁", "🪘",
    "🎷", "🎺", "🪗", "🎸", "🪕", "🎻", "🎲", "♟️", "🎯", "🎳",
    "🎮", "🕹️", "🎰", "🧩", "🪄", "🎁", "🎀", "🎊", "🎉", "🎈",
  ],
  "Travel & Places": [
    "🚗", "🚕", "🚙", "🚌", "🚎", "🏎️", "🚓", "🚑", "🚒", "🚐",
    "🛻", "🚚", "🚛", "🚜", "🛵", "🏍️", "🛺", "🚲", "🛴", "🚨",
    "🚔", "🚍", "🚘", "🚖", "🚡", "🚠", "🚟", "🚃", "🚋", "🚞",
    "🚝", "🚄", "🚅", "🚈", "🚂", "🚆", "🚇", "🚊", "🚉", "✈️",
    "🛫", "🛬", "🛩️", "💺", "🛰️", "🚀", "🛸", "🚁", "🛶", "⛵",
    "🚤", "🛥️", "🛳️", "⛴️", "🚢", "🗼", "🏰", "🏯", "🏟️", "🎡",
    "🎢", "🎠", "⛲", "⛱️", "🏖️", "🏝️", "🏜️", "🌋", "⛰️", "🏔️",
    "🗻", "🏕️", "⛺", "🏠", "🏡", "🏢", "🏣", "🏤", "🏥", "🏦",
  ],
  Objects: [
    "⌚", "📱", "📲", "💻", "⌨️", "🖥️", "🖨️", "🖱️", "🖲️", "💽",
    "💾", "💿", "📀", "📼", "📷", "📸", "📹", "🎥", "📽️", "🎞️",
    "📞", "☎️", "📟", "📠", "📺", "📻", "🎙️", "🎚️", "🎛️", "🧭",
    "⏱️", "⏲️", "⏰", "🕰️", "⌛", "⏳", "📡", "🔋", "🔌", "💡",
    "🔦", "🕯️", "🪔", "🧯", "🛢️", "💸", "💵", "💴", "💶", "💷",
    "🪙", "💰", "💳", "💎", "⚖️", "🪜", "🧰", "🪛", "🔧", "🔨",
    "⚒️", "🛠️", "⛏️", "🪚", "🔩", "⚙️", "🪤", "🧱", "⛓️", "🧲",
    "📿", "💈", "⚗️", "🔭", "🔬", "🕳️", "🩹", "🩺", "💊", "💉",
  ],
  Symbols: [
    "❤️", "🧡", "💛", "💚", "💙", "💜", "🖤", "🤍", "🤎", "💔",
    "❣️", "💕", "💞", "💓", "💗", "💖", "💘", "💝", "💟", "☮️",
    "✝️", "☪️", "🕉️", "☸️", "✡️", "🔯", "🕎", "☯️", "☦️", "🛐",
    "⛎", "♈", "♉", "♊", "♋", "♌", "♍", "♎", "♏", "♐",
    "♑", "♒", "♓", "🆔", "⚛️", "🉑", "☢️", "☣️", "📴", "📳",
    "🈶", "🈚", "🈸", "🈺", "🈷️", "✴️", "🆚", "💮", "🉐", "㊙️",
    "㊗️", "🈴", "🈵", "🈹", "🈲", "🅰️", "🅱️", "🆎", "🆑", "🅾️",
    "🆘", "❌", "⭕", "🛑", "⛔", "📛", "🚫", "💯", "💢", "♨️",
  ],
  Flags: [
    "🏁", "🚩", "🎌", "🏴", "🏳️", "🏳️‍🌈", "🏳️‍⚧️", "🏴‍☠️", "🇦🇨", "🇦🇩",
    "🇦🇪", "🇦🇫", "🇦🇬", "🇦🇮", "🇦🇱", "🇦🇲", "🇦🇴", "🇦🇶", "🇦🇷", "🇦🇸",
    "🇦🇹", "🇦🇺", "🇦🇼", "🇦🇽", "🇦🇿", "🇧🇦", "🇧🇧", "🇧🇩", "🇧🇪", "🇧🇫",
    "🇧🇬", "🇧🇭", "🇧🇮", "🇧🇯", "🇧🇱", "🇧🇲", "🇧🇳", "🇧🇴", "🇧🇶", "🇧🇷",
    "🇧🇸", "🇧🇹", "🇧🇻", "🇧🇼", "🇧🇾", "🇧🇿", "🇨🇦", "🇨🇨", "🇨🇩", "🇨🇫",
    "🇨🇬", "🇨🇭", "🇨🇮", "🇨🇰", "🇨🇱", "🇨🇲", "🇨🇳", "🇨🇴", "🇨🇵", "🇨🇷",
    "🇨🇺", "🇨🇻", "🇨🇼", "🇨🇽", "🇨🇾", "🇨🇿", "🇩🇪", "🇩🇬", "🇩🇯", "🇩🇰",
    "🇩🇲", "🇩🇴", "🇩🇿", "🇪🇦", "🇪🇨", "🇪🇪", "🇪🇬", "🇪🇭", "🇪🇷", "🇪🇸",
  ],
};

// Recently used emojis (stored in localStorage)
const getRecentEmojis = () => {
  try {
    const recent = localStorage.getItem("recentEmojis");
    return recent ? JSON.parse(recent) : [];
  } catch {
    return [];
  }
};

const saveRecentEmoji = (emoji) => {
  try {
    let recent = getRecentEmojis();
    recent = [emoji, ...recent.filter((e) => e !== emoji)].slice(0, 24);
    localStorage.setItem("recentEmojis", JSON.stringify(recent));
  } catch {
    // Ignore localStorage errors
  }
};

// Emoji Picker Component
const EmojiPicker = ({ onSelect, onClose }) => {
  const [activeCategory, setActiveCategory] = useState("Smileys & People");
  const [searchQuery, setSearchQuery] = useState("");
  const [recentEmojis, setRecentEmojis] = useState(getRecentEmojis());
  const pickerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  const handleEmojiClick = (emoji) => {
    onSelect(emoji);
    saveRecentEmoji(emoji);
    setRecentEmojis(getRecentEmojis());
  };

  const filteredEmojis = useMemo(() => {
    if (!searchQuery) return null;
    const allEmojis = Object.values(emojiData).flat();
    return allEmojis.filter((emoji) =>
      emoji.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  const categoryIcons = {
    "Smileys & People": "😀",
    "Animals & Nature": "🐶",
    "Food & Drink": "🍎",
    Activities: "⚽",
    "Travel & Places": "🚗",
    Objects: "💡",
    Symbols: "❤️",
  };

  return (
    <div
      ref={pickerRef}
      className="absolute bottom-full left-0 mb-2 bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl shadow-2xl w-[320px] md:w-[350px] overflow-hidden animate-scaleIn z-50"
    >
      {/* Search Bar */}
      <div className="p-3 border-b border-[#2a2a2a]">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search emojis..."
          className="w-full px-3 py-2 bg-[#0a0a0a] border border-[#2a2a2a] rounded-lg text-white text-sm placeholder-[#6a6a6a] focus:outline-none focus:border-[#0078D7]"
        />
      </div>

      {/* Category Tabs */}
      {!searchQuery && (
        <div className="flex items-center gap-1 px-2 py-2 border-b border-[#2a2a2a] overflow-x-auto scrollbar-hide">
          {recentEmojis.length > 0 && (
            <button
              onClick={() => setActiveCategory("Recent")}
              className={`p-2 rounded-lg text-lg flex-shrink-0 transition-colors ${activeCategory === "Recent"
                ? "bg-[#0078D7]"
                : "hover:bg-[#2a2a2a]"
                }`}
              title="Recent"
            >
              🕐
            </button>
          )}
          {Object.keys(emojiData).map((category) => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`p-2 rounded-lg text-lg flex-shrink-0 transition-colors ${activeCategory === category
                ? "bg-[#0078D7]"
                : "hover:bg-[#2a2a2a]"
                }`}
              title={category}
            >
              {categoryIcons[category]}
            </button>
          ))}
        </div>
      )}

      {/* Emoji Grid */}
      <div className="h-[250px] overflow-y-auto p-2">
        {searchQuery ? (
          <div className="grid grid-cols-8 gap-1">
            {filteredEmojis && filteredEmojis.length > 0 ? (
              filteredEmojis.map((emoji, index) => (
                <button
                  key={index}
                  onClick={() => handleEmojiClick(emoji)}
                  className="p-2 text-xl hover:bg-[#2a2a2a] rounded-lg transition-colors"
                >
                  {emoji}
                </button>
              ))
            ) : (
              <div className="col-span-8 text-center py-8 text-[#6a6a6a]">
                No emojis found
              </div>
            )}
          </div>
        ) : (
          <>
            {activeCategory === "Recent" && recentEmojis.length > 0 && (
              <>
                <p className="text-xs text-[#6a6a6a] px-2 py-1 uppercase tracking-wider">
                  Recently Used
                </p>
                <div className="grid grid-cols-8 gap-1 mb-2">
                  {recentEmojis.map((emoji, index) => (
                    <button
                      key={index}
                      onClick={() => handleEmojiClick(emoji)}
                      className="p-2 text-xl hover:bg-[#2a2a2a] rounded-lg transition-colors"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </>
            )}
            {activeCategory !== "Recent" && (
              <>
                <p className="text-xs text-[#6a6a6a] px-2 py-1 uppercase tracking-wider">
                  {activeCategory}
                </p>
                <div className="grid grid-cols-8 gap-1">
                  {emojiData[activeCategory]?.map((emoji, index) => (
                    <button
                      key={index}
                      onClick={() => handleEmojiClick(emoji)}
                      className="p-2 text-xl hover:bg-[#2a2a2a] rounded-lg transition-colors"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
};

// Message Parser Component - Handles links, phone numbers, emails (Clean version without icons)
const ParsedMessage = ({ text, isOwn }) => {
  const parseMessage = (message) => {
    // Regular expressions for different patterns
    const urlPattern = /(https?:\/\/[^\s]+)|(www\.[^\s]+)/gi;
    const emailPattern = /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/gi;
    const phonePattern = /(\+?[\d][\d\s\-().]{7,}[\d])/g;

    // Combine all patterns
    const combinedPattern = new RegExp(
      `(${urlPattern.source})|(${emailPattern.source})|(${phonePattern.source})`,
      "gi"
    );

    const parts = [];
    let lastIndex = 0;
    let match;

    const matches = [];
    while ((match = combinedPattern.exec(message)) !== null) {
      const matchText = match[0];
      let type = "url";

      if (matchText.includes("@") && !matchText.includes("://")) {
        type = "email";
      } else if (/^[\+\d][\d\s\-().]+[\d]$/.test(matchText.trim())) {
        type = "phone";
      }

      matches.push({
        index: match.index,
        text: matchText,
        type: type,
      });
    }

    matches.sort((a, b) => a.index - b.index);

    matches.forEach((m) => {
      if (m.index > lastIndex) {
        parts.push({
          type: "text",
          content: message.slice(lastIndex, m.index),
        });
      }
      parts.push({
        type: m.type,
        content: m.text,
      });
      lastIndex = m.index + m.text.length;
    });

    if (lastIndex < message.length) {
      parts.push({
        type: "text",
        content: message.slice(lastIndex),
      });
    }

    return parts.length > 0 ? parts : [{ type: "text", content: message }];
  };

  const parsedParts = parseMessage(text);

  const getLinkHref = (type, content) => {
    switch (type) {
      case "url":
        return content.startsWith("http") ? content : `https://${content}`;
      case "email":
        return `mailto:${content}`;
      case "phone":
        return `tel:${content.replace(/[\s\-().]/g, "")}`;
      default:
        return content;
    }
  };

  return (
    <span>
      {parsedParts.map((part, index) => {
        if (part.type === "text") {
          return <span key={index}>{part.content}</span>;
        }

        // Clean link styling without icons
        return (
          <a
            key={index}
            href={getLinkHref(part.type, part.content)}
            target={part.type === "url" ? "_blank" : undefined}
            rel={part.type === "url" ? "noopener noreferrer" : undefined}
            className={`${isOwn
              ? "text-white underline decoration-white/60 hover:decoration-white decoration-1 underline-offset-2"
              : "text-[#3b9eff] hover:text-[#5aadff] underline decoration-[#3b9eff]/50 hover:decoration-[#3b9eff] decoration-1 underline-offset-2"
              } break-all transition-colors`}
            onClick={(e) => e.stopPropagation()}
          >
            {part.content}
          </a>
        );
      })}
    </span>
  );
};

const ChatWindow = ({ user, closeChat }) => {
  const userdata = JSON.parse(localStorage.getItem("User"));
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [menuOpen, setMenuOpen] = useState(false);
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [selectedMessages, setSelectedMessages] = useState([]);
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState("");
  const [notificationType, setNotificationType] = useState("success");
  const [showGroupDetails, setShowGroupDetails] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(true);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const menuRef = useRef(null);

  const getFirstLetter = (name) => {
    if (!name) return "";
    const words = name.split(" ");
    return words.map((word) => word[0]?.toUpperCase()).join("");
  };

  const getAvatarColor = (name) => {
    const colors = [
      { bg: "#E3F2FD", text: "#1565C0" },
      { bg: "#FCE4EC", text: "#C2185B" },
      { bg: "#E8F5E9", text: "#2E7D32" },
      { bg: "#FFF3E0", text: "#E65100" },
      { bg: "#F3E5F5", text: "#7B1FA2" },
      { bg: "#E0F7FA", text: "#00838F" },
    ];
    const index = name ? name.charCodeAt(0) % colors.length : 0;
    return colors[index];
  };

  const getUsernameColor = (name) => {
    const colors = [
      "#60A5FA",
      "#34D399",
      "#F472B6",
      "#FBBF24",
      "#A78BFA",
      "#FB923C",
      "#2DD4BF",
      "#F87171",
    ];
    const index = name ? name.charCodeAt(0) % colors.length : 0;
    return colors[index];
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (inputRef.current && !isSelectionMode) {
      inputRef.current.focus();
    }
  }, [user._id, isSelectionMode]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape") {
        if (showEmojiPicker) {
          setShowEmojiPicker(false);
        } else if (showDeleteConfirm) {
          setShowDeleteConfirm(false);
        } else if (isSelectionMode) {
          exitSelectionMode();
        }
      }
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isSelectionMode, showDeleteConfirm, showEmojiPicker]);

  const getMessages_ = async () => {
    if (!user?._id) {
      setLoadingMessages(false);
      console.error("No user ID provided");
      return;
    }

    try {
      setLoadingMessages(true);
      const response = await getMessages(user._id);
      setMessages(response?.messages || []);
    } catch (error) {
      console.error("Error fetching messages:", error);
      setMessages([]);
    } finally {
      setLoadingMessages(false);
    }
  };

  // Mark messages as read when viewing
  useEffect(() => {
    if (messages.length > 0 && user._id) {
      // Emit read status to server
      socket.emit("messages_read", {
        groupId: user._id,
        readBy: userdata._id,
      });
    }
  }, [messages, user._id]);

  useEffect(() => {
    const handleReceiveMessage = (newMessage) => {
      setMessages((prevMessages) => [...prevMessages, newMessage]);
      if (newMessage.username !== userdata.fullname) {
        notification.play();
        // Mark as read immediately if chat is open
        socket.emit("messages_read", {
          groupId: user._id,
          readBy: userdata._id,
        });
      }
    };

    const handleMessagesRead = (data) => {
      // Update messages read status
      if (data.groupId === user._id) {
        setMessages((prevMessages) =>
          prevMessages.map((msg) => ({
            ...msg,
            readBy: data.readBy
              ? [...(msg.readBy || []), data.readBy]
              : msg.readBy,
          }))
        );
      }
    };

    socket.on("receive_message", handleReceiveMessage);
    socket.on("messages_read", handleMessagesRead);

    return () => {
      socket.off("receive_message", handleReceiveMessage);
      socket.off("messages_read", handleMessagesRead);
    };
  }, [user._id, userdata.fullname]);

  useEffect(() => {
    setMessages([]);
    exitSelectionMode();
    setShowEmojiPicker(false);
    if (user?._id) {
      getMessages_();
    } else {
      setLoadingMessages(false);
    }
  }, [user?._id]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (message.trim() === "") return;
    socket.emit("send_message", {
      message: message,
      username: userdata.fullname,
      groupId: user._id,
    });
    setMessage("");
    setShowEmojiPicker(false);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e);
    }
  };

  const handleEmojiSelect = (emoji) => {
    setMessage((prev) => prev + emoji);
    inputRef.current?.focus();
  };

  const formattedTime = (time) => {
    const date = new Date(time);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const formatDate = (date) => {
    const today = new Date();
    const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);

    if (date.toDateString() === today.toDateString()) return "Today";
    if (date.toDateString() === yesterday.toDateString()) return "Yesterday";
    return date.toLocaleDateString([], {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  };

  const handleMessageSelect = (messageId) => {
    if (!isSelectionMode) return;
    setSelectedMessages((prev) =>
      prev.includes(messageId)
        ? prev.filter((id) => id !== messageId)
        : [...prev, messageId]
    );
  };

  const handleMessageLongPress = (messageId) => {
    if (!isSelectionMode) {
      setIsSelectionMode(true);
      setSelectedMessages([messageId]);
    }
  };

  const exitSelectionMode = () => {
    setIsSelectionMode(false);
    setSelectedMessages([]);
    setShowDeleteConfirm(false);
  };

  const selectAllMessages = () => {
    const allMessageIds = messages.map((msg) => msg._id);
    setSelectedMessages(allMessageIds);
  };

  const showToast = (message, type = "success") => {
    setNotificationMessage(message);
    setNotificationType(type);
    setShowNotification(true);
    setTimeout(() => setShowNotification(false), 3000);
  };

  const handleDeleteSelectedMessages = async () => {
    if (selectedMessages.length === 0) {
      showToast("Please select messages to delete", "error");
      return;
    }

    setIsDeleting(true);
    try {
      for (const messageId of selectedMessages) {
        await deleteMessage(messageId);
      }
      setMessages((prev) =>
        prev.filter((msg) => !selectedMessages.includes(msg._id))
      );
      showToast(
        `${selectedMessages.length} message${selectedMessages.length > 1 ? "s" : ""
        } deleted`,
        "success"
      );
      exitSelectionMode();
    } catch (error) {
      console.error("Error deleting messages:", error);
      showToast("Failed to delete messages", "error");
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const getChatDisplayName = () => {
    if (!user || !user.groupName) return "Unknown";
    if (userdata.fullname === user.groupName) {
      return (user.members || [])
        .filter((m) => m._id !== userdata._id)
        .map((m) => m.fullname)
        .join(", ") || "Unknown";
    }
    return user.groupName;
  };

  const getChatInitials = () => {
    if (!user || !user.groupName) return "?";
    if (userdata.fullname === user.groupName) {
      return (user.members || [])
        .filter((m) => m._id !== userdata._id)
        .map((m) => getFirstLetter(m.fullname))
        .join("") || "?";
    }
    return getFirstLetter(user.groupName);
  };

  const avatarColor = getAvatarColor(getChatDisplayName());

  const groupedMessages = messages.reduce((acc, message) => {
    const date = formatDate(new Date(message.createdAt));
    if (!acc[date]) acc[date] = [];
    acc[date].push(message);
    return acc;
  }, {});

  const shouldShowSenderName = (msgs, index, currentMsg) => {
    if (!user.isGroup) return false;
    if (currentMsg.username === userdata.fullname) return false;
    if (index === 0) return true;
    return msgs[index - 1].username !== currentMsg.username;
  };

  return (
    <>
      <div className="flex-1 bg-[#0a0a0a] h-screen flex flex-col relative">
        {/* Regular Header */}
        <div
          className={`flex justify-between items-center px-4 py-3 border-b border-[#1a1a1a] bg-[#0a0a0a] transition-all duration-200 ${isSelectionMode ? "hidden" : "flex"
            }`}
        >
          <div className="flex items-center gap-3">
            <button
              onClick={closeChat}
              className="md:hidden w-8 h-8 rounded-full hover:bg-[#1a1a1a] flex items-center justify-center text-white"
            >
              <IoArrowBack size={20} />
            </button>

            <div
              className="w-10 h-10 md:w-11 md:h-11 rounded-full flex items-center justify-center"
              style={{ backgroundColor: avatarColor.bg }}
            >
              <span
                className="text-sm md:text-base font-semibold"
                style={{ color: avatarColor.text }}
              >
                {getChatInitials()}
              </span>
            </div>

            <div>
              <h3 className="text-white font-semibold text-sm md:text-base truncate max-w-[150px] md:max-w-[250px]">
                {getChatDisplayName()}
              </h3>
              {user.isGroup && (
                <p className="text-[#8a8a8a] text-xs">
                  {user.members.length} members
                </p>
              )}
            </div>
          </div>

          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-2 rounded-lg hover:bg-[#1a1a1a] text-[#8a8a8a] hover:text-white transition-colors"
            >
              <CiMenuKebab size={20} />
            </button>

            {menuOpen && (
              <div className="absolute right-0 top-full mt-2 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg shadow-xl min-w-[180px] z-50 py-1 animate-fadeIn">
                {user.isGroup && (
                  <button
                    onClick={() => {
                      setShowGroupDetails(true);
                      setMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-white hover:bg-[#2a2a2a] transition-colors text-left"
                  >
                    <FiUsers size={16} className="text-[#0078D7]" />
                    <span className="text-sm">Group Details</span>
                  </button>
                )}
                <button
                  onClick={() => {
                    setIsSelectionMode(true);
                    setMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-white hover:bg-[#2a2a2a] transition-colors text-left"
                >
                  <FiCheck size={16} className="text-[#0078D7]" />
                  <span className="text-sm">Select Messages</span>
                </button>
                <button
                  onClick={() => {
                    closeChat();
                    setMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-white hover:bg-[#2a2a2a] transition-colors text-left"
                >
                  <IoClose size={16} className="text-red-400" />
                  <span className="text-sm">Close Chat</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Selection Mode Header */}
        <div
          className={`items-center justify-between px-4 py-3 border-b border-[#1a1a1a] bg-[#1a1a1a] transition-all duration-200 ${isSelectionMode ? "flex" : "hidden"
            }`}
        >
          <div className="flex items-center gap-4">
            <button
              onClick={exitSelectionMode}
              className="w-8 h-8 rounded-full hover:bg-[#2a2a2a] flex items-center justify-center text-white transition-colors"
            >
              <IoArrowBack size={20} />
            </button>
            <span className="text-white font-medium">
              {selectedMessages.length} selected
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={selectAllMessages}
              className="px-3 py-1.5 rounded-lg text-sm text-[#0078D7] hover:bg-[#2a2a2a] transition-colors"
            >
              Select All
            </button>

            <button
              onClick={() => {
                if (selectedMessages.length > 0) {
                  setShowDeleteConfirm(true);
                } else {
                  showToast("Select messages to delete", "error");
                }
              }}
              disabled={selectedMessages.length === 0}
              className={`p-2 rounded-lg transition-colors ${selectedMessages.length > 0
                ? "text-red-400 hover:bg-red-500/20"
                : "text-[#4a4a4a] cursor-not-allowed"
                }`}
            >
              <IoTrashOutline size={20} />
            </button>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 bg-[#0a0a0a]">
          {loadingMessages ? (
            <div className="flex flex-col items-center justify-center h-full">
              <div className="w-12 h-12 border-4 border-[#0078D7] border-t-transparent rounded-full animate-spin mb-4"></div>
              <p className="text-[#8a8a8a]">Loading messages...</p>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center px-8">
              <div className="w-20 h-20 rounded-full bg-[#1a1a1a] flex items-center justify-center mb-4">
                <LuSendHorizontal size={32} className="text-[#0078D7]" />
              </div>
              <h3 className="text-white font-semibold text-lg mb-2">
                No messages yet
              </h3>
              <p className="text-[#8a8a8a] text-sm">
                Send a message to start the conversation
              </p>
            </div>
          ) : (
            <>
              {Object.entries(groupedMessages).map(([date, msgs]) => (
                <div key={date} className="mb-4">
                  <div className="flex items-center justify-center mb-4">
                    <span className="px-3 py-1 bg-[#1a1a1a] rounded-full text-xs text-[#8a8a8a]">
                      {date}
                    </span>
                  </div>

                  {msgs.map((msg, index) => {
                    const isOwn = msg.username === userdata.fullname;
                    const isSelected = selectedMessages.includes(msg._id);
                    const senderColor = getAvatarColor(msg.username);
                    const usernameColor = getUsernameColor(msg.username);
                    const showName = shouldShowSenderName(msgs, index, msg);

                    return (
                      <div
                        key={msg._id}
                        className={`flex ${showName ? "mt-3" : "mt-1"} ${isOwn ? "justify-end" : "justify-start"
                          }`}
                      >
                        <div
                          className={`flex items-center gap-2 max-w-[85%] md:max-w-[70%] ${isOwn ? "flex-row-reverse" : "flex-row"
                            }`}
                        >
                          {/* Selection Checkbox */}
                          {isSelectionMode && (
                            <button
                              onClick={() => handleMessageSelect(msg._id)}
                              className="flex-shrink-0 transition-transform hover:scale-110"
                            >
                              {isSelected ? (
                                <RiCheckboxCircleFill
                                  size={22}
                                  className="text-[#0078D7]"
                                />
                              ) : (
                                <RiCheckboxCircleLine
                                  size={22}
                                  className="text-[#4a4a4a] hover:text-[#6a6a6a]"
                                />
                              )}
                            </button>
                          )}

                          {/* Avatar for group chats */}
                          {user.isGroup && !isOwn && !isSelectionMode && (
                            <div
                              className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${showName ? "visible" : "invisible"
                                }`}
                              style={{ backgroundColor: senderColor.bg }}
                            >
                              <span
                                className="text-[10px] font-semibold"
                                style={{ color: senderColor.text }}
                              >
                                {getFirstLetter(msg.username)}
                              </span>
                            </div>
                          )}

                          {/* Message Bubble */}
                          <div
                            onClick={() => handleMessageSelect(msg._id)}
                            onContextMenu={(e) => {
                              e.preventDefault();
                              handleMessageLongPress(msg._id);
                            }}
                            className={`relative cursor-pointer transition-all duration-150 ${isOwn
                              ? "bg-[#0078D7] text-white rounded-2xl rounded-br-sm"
                              : "bg-[#1a1a1a] text-white rounded-2xl rounded-bl-sm"
                              } ${isSelected && isSelectionMode
                                ? "ring-2 ring-[#0078D7] bg-opacity-80"
                                : ""
                              } ${isSelectionMode ? "hover:bg-opacity-80" : ""}`}
                          >
                            <div className="px-3 py-1.5">
                              {showName && (
                                <p
                                  className="text-[11px] font-medium mb-0.5"
                                  style={{ color: usernameColor }}
                                >
                                  {msg.username}
                                </p>
                              )}

                              <div className="flex items-end gap-2">
                                <p className="text-sm break-words leading-relaxed">
                                  <ParsedMessage
                                    text={msg.message}
                                    isOwn={isOwn}
                                  />
                                </p>
                                <div className="flex items-center gap-0.5 flex-shrink-0 pb-0.5">
                                  <span
                                    className={`text-[10px] ${isOwn
                                      ? "text-white/60"
                                      : "text-[#6a6a6a]"
                                      }`}
                                  >
                                    {formattedTime(msg.createdAt)}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* Input Area - Hidden in Selection Mode */}
        {!isSelectionMode && (
          <div className="p-3 md:p-4 border-t border-[#1a1a1a] bg-[#0a0a0a] relative">
            {/* Emoji Picker */}
            {showEmojiPicker && (
              <EmojiPicker
                onSelect={handleEmojiSelect}
                onClose={() => setShowEmojiPicker(false)}
              />
            )}

            <div className="flex items-center gap-2 md:gap-3">
              {/* Emoji Button */}
              <button
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                className={`p-2 rounded-full transition-colors ${showEmojiPicker
                  ? "bg-[#0078D7] text-white"
                  : "text-[#6a6a6a] hover:text-white hover:bg-[#1a1a1a]"
                  }`}
              >
                <BsEmojiSmile size={22} />
              </button>

              <input
                ref={inputRef}
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                onFocus={() => setShowEmojiPicker(false)}
                placeholder="Type a message..."
                className="flex-1 px-4 py-2.5 md:py-3 bg-[#1a1a1a] rounded-full border border-[#2a2a2a] text-white placeholder-[#6a6a6a] focus:outline-none focus:border-[#0078D7] transition-colors text-sm md:text-base"
              />
              <button
                onClick={handleSendMessage}
                disabled={!message.trim()}
                className={`w-10 h-10 md:w-11 md:h-11 rounded-full flex items-center justify-center transition-colors ${message.trim()
                  ? "bg-[#0078D7] text-white hover:bg-[#006abc]"
                  : "bg-[#1a1a1a] text-[#6a6a6a] cursor-not-allowed"
                  }`}
              >
                <LuSendHorizontal size={18} />
              </button>
            </div>
          </div>
        )}

        {/* Selection Mode Footer */}
        {isSelectionMode && (
          <div className="p-3 md:p-4 border-t border-[#1a1a1a] bg-[#1a1a1a]">
            <div className="flex items-center justify-between">
              <p className="text-[#8a8a8a] text-sm hidden sm:block">
                Tap messages to select • Right-click to start selecting
              </p>
              <p className="text-[#8a8a8a] text-sm sm:hidden">Tap to select</p>
              <button
                onClick={() => {
                  if (selectedMessages.length > 0) {
                    setShowDeleteConfirm(true);
                  }
                }}
                disabled={selectedMessages.length === 0}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${selectedMessages.length > 0
                  ? "bg-red-500 text-white hover:bg-red-600"
                  : "bg-[#2a2a2a] text-[#4a4a4a] cursor-not-allowed"
                  }`}
              >
                <IoTrashOutline size={18} />
                <span>Delete ({selectedMessages.length})</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-[#1a1a1a] rounded-xl w-full max-w-sm border border-[#2a2a2a] overflow-hidden animate-scaleIn">
            <div className="p-5 text-center">
              <div className="w-14 h-14 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <IoTrashOutline size={28} className="text-red-400" />
              </div>
              <h3 className="text-white text-lg font-semibold mb-2">
                Delete {selectedMessages.length} message
                {selectedMessages.length > 1 ? "s" : ""}?
              </h3>
              <p className="text-[#8a8a8a] text-sm">
                This action cannot be undone. The selected message
                {selectedMessages.length > 1 ? "s" : ""} will be permanently
                removed.
              </p>
            </div>

            <div className="flex border-t border-[#2a2a2a]">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isDeleting}
                className="flex-1 py-3.5 text-white font-medium hover:bg-[#2a2a2a] transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <div className="w-px bg-[#2a2a2a]"></div>
              <button
                onClick={handleDeleteSelectedMessages}
                disabled={isDeleting}
                className="flex-1 py-3.5 text-red-400 font-medium hover:bg-red-500/20 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isDeleting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-red-400/30 border-t-red-400 rounded-full animate-spin"></div>
                    <span>Deleting...</span>
                  </>
                ) : (
                  <>
                    <IoTrashOutline size={18} />
                    <span>Delete</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {showNotification && (
        <div
          className={`fixed bottom-24 left-1/2 transform -translate-x-1/2 px-4 py-3 rounded-lg shadow-xl flex items-center gap-3 z-50 animate-slideUp ${notificationType === "success"
            ? "bg-[#1a1a1a] border border-[#2a2a2a]"
            : "bg-red-500"
            }`}
        >
          {notificationType === "success" ? (
            <FiCheck className="text-green-400" size={18} />
          ) : (
            <IoClose className="text-white" size={18} />
          )}
          <span className="text-white text-sm">{notificationMessage}</span>
        </div>
      )}

      {/* Add Member Modal */}
      <AddMemberModal
        show={showAddMemberModal}
        handleClose={() => setShowAddMemberModal(false)}
        user={user}
      />

      {/* Group Details Modal */}
      {showGroupDetails && user.isGroup && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-[#1a1a1a] rounded-lg w-full max-w-md border border-[#2a2a2a] overflow-hidden">
            <div className="p-4 border-b border-[#2a2a2a] bg-[#0a0a0a] flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white">
                Group Details
              </h2>
              <button
                onClick={() => setShowGroupDetails(false)}
                className="w-8 h-8 rounded-full hover:bg-[#2a2a2a] flex items-center justify-center text-[#8a8a8a] hover:text-white"
              >
                <IoClose size={20} />
              </button>
            </div>

            <div className="p-4">
              <div className="flex items-center gap-4 mb-6">
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: avatarColor.bg }}
                >
                  <span
                    className="text-xl font-semibold"
                    style={{ color: avatarColor.text }}
                  >
                    {getFirstLetter(user.groupName)}
                  </span>
                </div>
                <div>
                  <h3 className="text-white font-semibold text-lg">
                    {user.groupName}
                  </h3>
                  <p className="text-[#8a8a8a] text-sm">
                    {user.members.length} members
                  </p>
                </div>
              </div>

              <div className="mb-4">
                <h4 className="text-[#8a8a8a] text-xs uppercase tracking-wider mb-3">
                  Members
                </h4>
                <div className="space-y-2 max-h-[200px] overflow-y-auto">
                  {user.members.map((member) => {
                    const memberColor = getAvatarColor(member.fullname);
                    return (
                      <div
                        key={member._id}
                        className="flex items-center gap-3 p-2 rounded-lg hover:bg-[#2a2a2a]"
                      >
                        <div
                          className="w-9 h-9 rounded-full flex items-center justify-center"
                          style={{ backgroundColor: memberColor.bg }}
                        >
                          <span
                            className="text-xs font-semibold"
                            style={{ color: memberColor.text }}
                          >
                            {getFirstLetter(member.fullname)}
                          </span>
                        </div>
                        <span className="text-white text-sm">
                          {member.fullname}
                          {member._id === userdata._id && (
                            <span className="text-[#0078D7] text-xs ml-2">
                              (You)
                            </span>
                          )}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <button
                onClick={() => {
                  setShowGroupDetails(false);
                  setTimeout(() => setShowAddMemberModal(true), 200);
                }}
                className="w-full flex items-center justify-center gap-2 bg-[#0078D7] text-white py-2.5 rounded-lg hover:bg-[#006abc] transition-colors"
              >
                <HiOutlineUserAdd size={18} />
                <span>Add Members</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Animation Styles */}
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translate(-50%, 20px);
          }
          to {
            opacity: 1;
            transform: translate(-50%, 0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
        .animate-scaleIn {
          animation: scaleIn 0.2s ease-out;
        }
        .animate-slideUp {
          animation: slideUp 0.3s ease-out;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </>
  );
};

export default ChatWindow;