<template>
  <div class="chatOpen" v-if="chatOpen">
    <div class="header">
      <h1 @click="changeChatState" class="header__title">Support</h1>
      <button @click="changeChatState" class="header__buttonForCloseChat">X</button>
    </div>
    <div ref="chatContent" class="chatContent">
      <div v-for="message in messages" :class="['message', message.sender]" :key="message.id">
        <h2 class="text">{{ message.message }}</h2>
        <div class="messageDescription">
          <h5 class="time">{{ displayTimes[message.id] ? displayTimes[message.id] : "now" }}</h5>
          <img v-if="message.seen==='yes'" src="@/assets/seen1.png" alt="seen yes" :class="['seen','seenYes']">
          <img v-else-if="message.seen==='no'" src="@/assets/seen1.png" alt="seen no" :class="['seen','seenNo']">
          <img v-else src="@/assets/seen3.png" alt="seen load" :class="['seen','seenLoad']">
        </div>
      </div>
    </div>
    <form @submit.prevent="sendMessage" class="chatInputMessageBlock">
      <input autocomplete="off" v-model="messageInput"
             :class="['chatInputMessageBlock__input',messageInput.length>=150&&'chatInputMessageBlock__inputRed']"
             type="text" name="message"
             placeholder="Message...">
      <h3 :class="messageInput.length<150?'limitSymbolGood':'limitSymbolBad'">{{ messageInput.length }}/150</h3>
      <div>
        <button type="button" @click="changeSmileListOpenState" @mouseenter="hoverMouseOnSmile(true)"
                @mouseleave="hoverMouseOnSmile(false)" class="chatInputMessageBlock__smile">
          <span :class="{'flip': mouseOnSmile}">{{ mouseOnSmile ? '👹' : '😇' }}</span>
        </button>
        <img alt="addFile" class="addFileImg" src="@/assets/addFile.png"/></div>

    </form>
    <transition name="smilesBlock" mode="out-in">
      <ul v-if="smileListOpen" class="smilesBlock">
        <li @click="handleEmojiSelected(smile)" class="smilesBlock__item" v-for="smile in smilesList" :key="smile">
          {{ smile }}
        </li>
      </ul>
    </transition>
  </div>
  <div v-else class="chatClose">
    <button @click="changeChatState" class="chatClose__buttonForOpenChat">?</button>
  </div>
</template>

<script>
import axios from "axios";

export default {
  data() {
    return {
      chatOpen: true,
      messages: [],
      messageInput: '',
      mouseOnSmile: false,
      smileListOpen: false,
      smilesList: ['😊', '🥰', '❤️', '💩', '👍', '👎', '🤝', '👌'],
      timer: null,
      displayTimes: {}
    }
  },
  methods: {
    updateTimes() {
      const updatedTimes = {};
      this.messages.forEach(message => {
        updatedTimes[message.id] = this.formatMessageTime(message.time);
      });
      this.displayTimes = updatedTimes;
    },
    changeChatState() {
      this.chatOpen = !this.chatOpen;
    },
    changeSmileListOpenState() {
      this.smileListOpen = !this.smileListOpen;
    },
    hoverMouseOnSmile(state) {
      this.mouseOnSmile = state;
    },
    handleEmojiSelected(emoji) {
      this.messageInput += emoji;
    },
    formatMessageTime(unixTimestamp) {
      const now = Math.floor(Date.now() / 1000);
      const diff = now - unixTimestamp;

      if (diff < 10) {
        return 'now';
      } else if (diff < 60) {
        return `${diff}s`;
      } else if (diff < 3600) {
        const minutes = Math.floor(diff / 60);
        return `${minutes}m`;
      } else if (diff < 86400) {
        const hours = Math.floor(diff / 3600);
        return `${hours}h`;
      } else {
        const date = new Date(unixTimestamp * 1000);
        const options = {day: 'numeric', month: 'short'}; // E.g., "12 May"
        return date.toLocaleDateString(undefined, options);
      }
    },
    sendMessage() {
      if (this.messageInput.length >= 150) return
      const now = Math.floor(Date.now() / 1000);
      const newMessageId = this.messages.length
      const newMessage = {
        id: newMessageId,
        message: this.messageInput,
        sender: "visitor",
        seen: "load",
        time: now
      }

      axios
          .post(`http://localhost:3000/api/sendMessage`, {newMessage},
              {withCredentials: true}
          )
          .then((response) => {
            console.log(response.data);
            this.messages[newMessageId].seen = 'no'
          })
          .catch((error) => {
            console.error("Error: ", error);
          })
          .finally(() => console.log('finally'));

      this.messages.push(newMessage)
      this.messageInput = ''
      this.scrollToBottom()
    },
    scrollToBottom() {
      const chatContent = this.$refs.chatContent;
      chatContent.scrollTop = chatContent.scrollHeight;
    }
  },
  watch: {
    messages: {
      handler() {
        this.$nextTick(() => {
          this.scrollToBottom();
        });
      },
      deep: true
    }
  },
  mounted() {
    axios
        .post(`http://localhost:3000/api/getMessages`, {},
            {withCredentials: true}
        )
        .then((response) => {
          console.log(response.data);
          if (response.data){
            if (response.data.messages){
              return this.messages = response.data.messages

            }
          }
          this.messages=[]
        })
        .catch((error) => {
          console.error("Error: ", error);
        })
        .finally(() => console.log('finally'));
    this.scrollToBottom();
    this.updateTimes()
    this.timer = setInterval(() => {
      if (this.messages) {
        this.updateTimes()
      }
    }, 1000);
  }
}
</script>

<style lang="scss" scoped>
.chatOpen {
  display: flex;
  flex-direction: column;
  width: 300px;
  height: 400px;
  border-radius: 10px;
  position: fixed;
  right: 20px;
  bottom: 20px;
  background-color: white;
  padding: 5px;
  border: rgba(0, 0, 0, 0.5) solid 2px;

  .header {
    height: 40px;
    display: flex;
    align-items: center;

    &__title {
      font-size: 30px;
      transition-duration: .3s;
      cursor: pointer;

      &:hover {
        font-size: 31px;
        transition-duration: .3s;
      }
    }

    &__buttonForCloseChat {
      position: absolute;
      right: 5px;
      width: 30px;
      height: 30px;
      background-color: #42b983;
      border-radius: 50%;
      color: aliceblue;
      font-weight: bold;
      font-size: 18px;
      border: black solid 2px;
      transition-duration: .3s;
      cursor: pointer;

      &:hover {
        transform: scale(1.1);
        transition-duration: .3s;
      }
    }

  }
}

.chatClose {
  position: fixed;
  right: 20px;
  bottom: 20px;

  &__buttonForOpenChat {
    width: 55px;
    height: 55px;
    background-color: #42b983;
    border-radius: 50%;
    color: aliceblue;
    font-weight: bold;
    font-size: 30px;
    border: black solid 2px;
    transition-duration: .3s;
    cursor: pointer;

    &:hover {
      transform: scale(1.1);
      transition-duration: .3s;
    }
  }
}

.chatContent {
  display: flex;
  flex-direction: column;
  position: relative;
  margin-top: 5px;
  width: 100%;
  height: 100%;
  border: 1px solid black;
  background-color: rgba(66, 185, 131, 0.14);
  border-radius: 10px 10px 0 0;
  overflow-y: auto;

  .messageDescription {
    display: flex;
    flex-direction: row-reverse;
    justify-content: space-between;
    align-items: center;

  }

  .message {
    display: flex;
    flex-direction: column;
    width: 70%;
    margin: 10px;
    border-radius: 10px;
    padding: 1px 5px;
    background-color: white;
    font-size: 12px;
    font-weight: bold;
    word-break: break-word; /* Это свойство позволяет разбивать длинные слова */
    overflow-wrap: anywhere;
  }

  .visitor {
    align-self: flex-end;
  }

  .support {
    align-self: flex-start;
  }

  .time {
    margin-top: -15px;
    margin-bottom: 1px;
    font-size: 14px;
    align-self: flex-end;
  }

  .seen {
    margin-top: -15px;
    width: 13px;
    align-self: flex-start;

    &No {
      opacity: .2;
    }

    &Load {
      animation: spin 2s linear infinite;
    }
  }
}

.chatInputMessageBlock {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: white;
  width: 100%;
  border-radius: 0 0 10px 10px;
  box-shadow: 0 -1px 3px rgba(0, 0, 0, 0.4);

  .limitSymbolGood {
    display: none;
  }

  .limitSymbolBad {
    position: absolute;
    right: 100px;
    font-size: 15px;
  }

  &__smile {
    background-color: rgba(66, 185, 131, 0.14);
    border-radius: 50%;
    padding: 0;
    font-size: 20px;
    transition-duration: .3s;
    cursor: pointer;
    perspective: 1000px;
    border: none;

    span {
      display: inline-block;
      transition: transform 0.6s;
      transform-style: preserve-3d;
    }

    .flip {
      transform: rotateY(180deg);
    }
  }

  &__input {
    color: #42b983;
    font-weight: bold;
    padding: 10px 3px;
    font-size: 16px;
    border: none;

    &Red {
      color: deeppink;
      width: 150px;
    }

    &::placeholder {
      color: gray;
    }

    &:focus {
      outline: none;
    }
  }


}

.smilesBlock {
  position: absolute;
  right: 8px;
  bottom: 48px;
  border: black solid 2px;
  width: 155px;
  background-color: white;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-wrap: wrap;
  margin: 0;
  padding: 0;
  list-style: none;

  &__item {
    font-size: 20px;
    padding: 5px;
    transition-duration: .3s;
    cursor: pointer;

    &:hover {
      opacity: .7;
      transition-duration: .3s;
    }
  }
}

.smilesBlock-enter-active, .smilesBlock-leave-active {
  transition: all .3s ease-in-out;
}

.smilesBlock-enter-from, .smilesBlock-leave-to {
  transform: translateY(20px) scale(0.9);
  opacity: 0;
}

.addFileImg {
  z-index: 1;
  margin: 0 15px;
  width: 20px;
  transition-duration: .3s;
  cursor: pointer;

  &:hover {
    transform: scale(1.1);
    opacity: .7;
    transition-duration: .3s;
  }
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

</style>
