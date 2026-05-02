const formLogin = document.getElementById("login-form")
const msgError = document.getElementById("login-error")


const btnUpload = document.getElementById("btn-upload")
const fileInput = document.getElementById("pdf-file")
const summaryBox = document.getElementById("summary-box")
const chatInput= document.getElementById("chat-input")
const btnSend = document.getElementById("btn-send")


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

