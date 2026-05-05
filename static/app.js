const formLogin = document.getElementById("login-form")
const msgError = document.getElementById("login-error")


const btnUpload = document.getElementById("btn-upload")
const fileInput = document.getElementById("pdf-file")
const summaryBox = document.getElementById("summary-box")
const chatInput= document.getElementById("chat-input")
const btnSend = document.getElementById("btn-send")
const chatBox =  document.getElementById("chat-box")

let documentoActualId = null 


// Se usa una funcion asincrona (async) considerando que la peticion a la API tomara unos milisegundos
formLogin.addEventListener("submit", async function(evento){
    evento.preventDefault()
    const emailUsuario = document.getElementById("login-email").value
    const PasswordUsuario = document.getElementById("login-password").value

    msgError.classList.add("hidden")

    try{
        const formData = new URLSearchParams()
        formData.append("username",emailUsuario)
        formData.append("password",PasswordUsuario)

        const respuesta = await fetch("/login/",{
            method: "POST",
            headers:{
                "Content-Type": "application/x-www-form-urlencoded"
            },
            body: formData
        })

        if (respuesta.ok){
            const datos = await respuesta.json()
            localStorage.setItem("token", datos.access_token)

            console.log("Login exitoso, token guardado")

            document.getElementById("auth-screen").classList.add("hidden")
            document.getElementById("dashboard-screen").classList.remove("hidden")
            document.getElementById("dashboard-screen").classList.add("flex")


        }else{
            msgError.classList.remove("hidden")
        }
    }catch(error){
        console.log("Error al comunicarse con la API:", error)
    }
})

btnUpload.addEventListener("click", async function () {
    const file = fileInput.files[0]

    if(!file){
        alert("Por favor, selecciona un archivo PDF primero.")
        return
    }

    btnUpload.innerHTML = '<i class="fa-solid fa-spinner fa-spin mr-2"></i>Procesando...';
    btnUpload.disabled = true
    summaryBox.innerHTML = '<span class="text-blue-600 italic"><i class="fa-solid fa-brain fa-pulse mr-2"></i>La IA está leyendo y resumiendo el documento. Esto puede tomar unos segundos...</span>';


    try{
        const formData = new FormData()
        formData.append("file",file)

        const token = localStorage.getItem("token")

        const respuesta = await fetch("/documentos/pdf",{
            method: "POST",
            headers : {
                "Authorization": `Bearer ${token}`
            },
            body: formData
        })

        if(respuesta.ok){
            const datos = await respuesta.json()

            documentoActualId = datos.id

            summaryBox.innerHTML = `<div class="text-gray-800 leading-relaxed">${datos.ai_summary}</div>`;

            chatInput.disabled = false
            btnSend.disabled = false
            chatInput.classList.remove("cursor-not-allowed")
            chatInput.classList.add("bg-white")
            btnSend.classList.remove("disabled:bg-gray-400", "disabled:cursor-not-allowed")
            chatInput.placeholder = "Haz una pregunta sobre este documento..."
        }else{
            summaryBox.innerHTML = '<span class="text-red-500 font-bold"><i class="fa-solid fa-circle-xmark mr-1"></i> Error al procesar el documento.</span>';
        }
    }catch (error){
        console.error("Error al subir el PDF:",error)

    }finally{
        btnUpload.innerHTML = '<i class="fa-solid fa-wand-magic-sparkles mr-2"></i>Extraer y Resumir';
        btnUpload.disabled = false
    }
    
})

async function enviarMensaje() {
    const pregunta  = chatInput.value.trim()

    if (!pregunta || !documentoActualId) return

    if (chatBox.innerHTML.includes("El chat está vacío")){
        chatBox.innerHTML = ""
    }

    chatBox.innerHTML += `
        <div class="flex justify-end animate-fade-in-up">
            <div class="bg-blue-600 text-white px-5 py-3 rounded-2xl rounded-tr-sm max-w-[80%] shadow-sm">
                ${pregunta}
            </div>
        </div>
    `

    chatInput.value = ""
    chatInput.disabled = true
    btnSend.disabled = true

    chatBox.scrollTop = chatBox.scrollHeight

    const  idMensajeIA = "msg-" + Date.now()
    chatBox.innerHTML += `
        <div class="flex justify-start">
            <div id="${idMensajeIA}" class="bg-white border border-gray-200 text-gray-800 px-5 py-3 rounded-2xl rounded-tl-sm max-w-[80%] shadow-sm flex items-center gap-3">
                <i class="fa-solid fa-robot text-blue-500"></i>
                <span class="text-gray-400 italic font-medium flex items-center gap-1">
                    Analizando el documento <i class="fa-solid fa-ellipsis fa-fade text-lg"></i>
                </span>
            </div>
        </div>
    `
    chatBox.scrollTop = chatBox.scrollHeight

    try{
        const token  = localStorage.getItem("token")

        const  respuesta = await fetch (`/documentos/${documentoActualId}/chat`,{
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({
                pregunta: pregunta
            })
        })

        const cajaIA = document.getElementById(idMensajeIA)

        if(respuesta.ok){
            const datos = await respuesta.json()

            cajaIA.innerHTML = `
                <i class="fa-solid fa-robot text-blue-500 mb-auto mt-1 text-lg"></i> 
                <div class="leading-relaxed">${datos.respuesta}</div>
            `
        }else{
            cajaIA.innerHTML = `<i class="fa-solid fa-triangle-exclamation text-red-500"></i> <span class="text-red-500 font-bold">Error al obtener respuesta del documento.</span>`;
        }

    } catch (error){
        console.error("Error en el chat:",error)
        document.getElementById(idMensajeIA).innerHTML = `<i class="fa-solid fa-wifi text-red-500"></i> <span class="text-red-500 font-bold">Error de conexión con el servidor.</span>`;
    }finally{

        chatInput.disabled = false
        btnSend.disabled = false
        chatInput.focus()
        chatBox.scrollTop = chatBox.scrollHeight
    }
    
}

btnSend.addEventListener("click",enviarMensaje)
chatInput.addEventListener("keypress", function(evento){
    if (evento.key === "Enter"){
        enviarMensaje()
    }
})

