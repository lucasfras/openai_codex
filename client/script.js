import bot from './assets/bot.svg'
import user from './assets/user.svg'

const form = document.querySelector('form')
const chatContainer = document.querySelector('#chat_container')

let loadInterval;

let loading = false

function loader(element) {
  loading = true;
  element.textContent = ''
  loadInterval = setInterval(() => {
    if(element.textContent === '...'){
      element.textContent = ''
    } else {
      element.textContent += '.'
    }
  }, 300)
}

function typeText(element, text) {
  loading = true
  let index = 0
  let interval = setInterval(() => {
    if(index < text.length){
      element.innerHTML += text.charAt(index)
      chatContainer.scrollTop = chatContainer.scrollHeight
      index++
    } else {
      loading = false
      clearInterval(interval)
    }
  }, 20)
}

function generateUniqueId() {
  const timeStamp = Date.now()
  const randomNumber = Math.random()
  const hexadecimalString = randomNumber.toString(16)

  return `id-${timeStamp}-${hexadecimalString}`
}

function chatStripe(isAi, value, uniqueId) {
  console.log(value)
  return (
    `
     <div class="wrapper ${isAi && 'ai'}">
      <div class="chat">
        <div class="profile">
          <img 
            src="${isAi ? bot : user}"
            src="${isAi ? 'bot' : 'user'}"
          />
        </div>
        <div class="message" id=${uniqueId}>${value}</div>
      </div>
     </div>
    `
  )
}

const handleSubmit = async (e) => {
  e.preventDefault();

  if(loading){
    alert("Wait until the bot complete the answer")
    return
  }

  const data = new FormData(form);


  //user chatStripe
  chatContainer.innerHTML += chatStripe(false, data.get('prompt'))
  form.reset()

  //bot chatStripe
  const uniqueId = generateUniqueId()
  chatContainer.innerHTML += chatStripe(true, " ", uniqueId)

  const teste = chatContainer.scrollTop = chatContainer.scrollHeight


  const messageDiv = document.getElementById(uniqueId)
  
  loader(messageDiv)

  const response = await fetch('http://localhost:3000', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      prompt: data.get('prompt')
    })
  })
  clearInterval(loadInterval)
  messageDiv.innerHTML = ''
  if(response.ok){
    const data = await response.json()
    const parsedData = data.bot.trim()

    typeText(messageDiv, parsedData)
  } else {
    const err = await response.text();
    messageDiv.innerHTML = "Something went wront"
    alert(err)
  }
}

form.addEventListener('submit', handleSubmit)
form.addEventListener('keyup', (e) => {
  if(e.key === 'Enter'){
    handleSubmit(e)
  }
})