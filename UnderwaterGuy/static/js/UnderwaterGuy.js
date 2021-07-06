/* La carpeta static guardará los recursos 
a los que se acceden desde el NAVEGADOR */

//Los objetos en JS tienen CASI la misma estructura que los dicc en Python
const categorias = {
    EUR: 'Euro(EUR)',
    BTC: 'Bitcoin(BTC)',
    ETH: 'Ethereum(ETH)',
    LTC: 'Litecoin(LTC)',
    DOGE: 'Dogecoin(DOGE)'
}

let losMovimientos 
xhr = new XMLHttpRequest() // Manejador de peticiones de forma asincrona
xhr2 = new XMLHttpRequest() // Necesitamos 2 para poder hacer dos llamadas sin que se pisen una a la otra

function recibeRespuesta() {
    if (this.readyState === 4 && (this.status === 200 || this.status === 201)) {
        const respuesta = JSON.parse(this.responseText)

        if (respuesta.status !== 'success') {
            alert("Se ha producido un error en acceso a servidor "+ respuesta.mensaje)
            return
        }

        alert(respuesta.mensaje)

        llamaApiMovimientos()
    }
}

function detallaMovimiento(id) {

    //movimiento = losMovimientos.filter(item => item.id == id )[0]

    let movimiento
    for (let i=0; i<losMovimientos.length; i++) {
        const item = losMovimientos[i]
        if (item.id == id ) {
            movimiento = item
            break
        }
    }

    if (!movimiento) return

    document.querySelector("#idMovimiento").value = id
    document.querySelector("#fecha").value = movimiento.fecha
    document.querySelector("#concepto").value = movimiento.concepto
    document.querySelector("#categoria").value = movimiento.categoria
    document.querySelector("#cantidad").value = movimiento.cantidad.toFixed(2)
    if (movimiento.esGasto == 1) {
        document.querySelector("#gasto").checked = true
    } else {
        document.querySelector("#ingreso").checked = true
    }
}

function muestraMovimientos() { 
    if (this.readyState === 4 && this.status === 200) {
        const respuesta = JSON.parse(this.responseText) //Convierte de string a objeto JSON

        if (respuesta.status !== 'success') {
            alert("Se ha producido un error en la consulta de movimientos")
            return
        }

        losMovimientos = respuesta.data
        const tbody = document.querySelector(".tabla-movimientos tbody") // Seleccionamos la clase tabla-movi para insentar cosas dentro de tbody
        tbody.innerHTML = ""

        for (let i = 0; i < respuesta.data.length; i++) {
            const movimiento = respuesta.data[i]
            const fila = document.createElement("tr")


            const dentro = `
                <td>${movimiento.fecha}</td>
                <td>${movimiento.hora}</td>
                <td>${movimiento.from_moneda}</td>
                <td>${movimiento.from_cantidad}</td>
                <td>${movimiento.to_moneda}</td>
                <td>${movimiento.to_cantidad}</td>
            `
            fila.innerHTML = dentro
            tbody.appendChild(fila)
        }
    }
}


function llamaApiMovimientos() {
    xhr.open('GET', `http://localhost:5000/api/v1/movimientos`, true) //Petición de tipo GET
    xhr.onload = muestraMovimientos 
    xhr.send() // Envio de petición a la URL
}

function capturaFormMovimiento() {
    const movimiento = {} // Esta función captura los valores en el formulario y los guarda en la variable movimiento, en un objeto
    movimiento.fecha = document.querySelector("#fecha").value
    movimiento.hora = document.querySelector("#hora").value
    movimiento.from_moneda = document.querySelector("#From_Moneda").value // movimiento es el objeto, from_moneda es el atributo
    movimiento.from_cantidad = document.querySelector("#From_Cantidad").value
    movimiento.to_moneda = document.querySelector("#To_Moneda").value
    movimiento.to_cantidad = document.querySelector("#To_Cantidad").value
    

    return movimiento    
}


function validar(movimiento) {
    if (!movimiento.fecha) {
        alert("Fecha obligatoria")
        return false
    }

    if (movimiento.concepto === "") {
        alert("Concepto obligatorio")
        return false
    }

    if (!document.querySelector("#gasto").checked && !document.querySelector("#ingreso").checked) {
        alert("Elija tipo de movimiento")
        return false
    }

    if (movimiento.esGasto && !movimiento.categoria) {
        alert("Debe selecccionar categoria del gasto")
        return false
    }

    if (!movimiento.esGasto && movimiento.categoria) {
        alert("Un ingreso no puede tener categoria")
        return false
    }

    if (movimiento.cantidad <= 0) {
        alert("La cantidad ha de ser positiva")
        return false
    }

    return true
}

function llamaApiModificaMovimiento(ev) {
    ev.preventDefault()
    id = document.querySelector("#idMovimiento").value
    if (!id) {
        alert("Selecciona un movimiento antes!")
        return
    }
    const movimiento = capturaFormMovimiento()
    if (!validar(movimiento)) {
        return
    }


    xhr.open("PUT", `http://localhost:5000/api/v1/movimiento/${id}`, true)
    xhr.onload = recibeRespuesta

    xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8")

    xhr.send(JSON.stringify(movimiento))
}

function llamaApiCreaMovimiento(ev) {
    ev.preventDefault()

    const movimiento = capturaFormMovimiento()
    if (!validar(movimiento)) {
        return
    }


    xhr.open("POST", `http://localhost:5000/api/v1/movimiento`, true)
    xhr.onload = recibeRespuesta //El metodo onload es el que se mantiene esperando la respuesta asincrona para luego procesarla

    xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8") // Informamos al servidor que los datos que vamos a mandar son de tipo JSON

    xhr.send(JSON.stringify(movimiento)) // Cadeniza el movimiento que deseamos enviar
}

function llamaApiStatus() {
    xhr2.open ("GET", `http://localhost:5000/api/v1/status`, true)
    xhr2.onload = recibeRespuestaStatus
    xhr2.send()
}

window.onload = function() {
// Todo lo que haya aquí adentro se ejecutará una vez que el HTML se renderice
//evitando que el JS entre en juego antes de tiempo.  
    llamaApiMovimientos()

   /* document.querySelector("#modificar")
        .addEventListener("click", llamaApiModificaMovimiento) */

    document.querySelector("#aceptar")
        .addEventListener("click", llamaApiCreaMovimiento)

}
