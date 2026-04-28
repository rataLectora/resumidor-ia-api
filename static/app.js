const formLogin = document.getElementById("login-form")


// Se usa una funcion asincrona (async) considerando que la peticion a la API tomara unos milisegundos
formLogin.addEventListener("submit", async function(evento){
    evento.preventDefault()

    const emailUsuario = document.getElementById("login-email").value
    const PasswordUsuario = document.getElementById("login-password").value
    const msgError = document.getElementById("login-error")

    msgError.classList.add("hidden")

    try{
        const formData = new URLSearchParams()
        formData.append("username",emailUsuario)
        formData.append("password",PasswordUsuario)

        const respuesta = await fetch("/login",{
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