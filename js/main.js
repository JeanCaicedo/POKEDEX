const listaPokemon = document.querySelector("#listaPokemon");
const botonesHeader = document.querySelectorAll(".btn-header");
const inputBusqueda = document.querySelector("#busqueda");
const btnMostrarFavoritos = document.querySelector("#mostrar-favoritos");
const btnOcultarFavoritos = document.querySelector("#ocultar-favoritos");
let URL = "https://pokeapi.co/api/v2/pokemon/";
let todosLosPokemon = [];
let modoFavoritos = false;


for (let i = 1; i <= 151; i++) {
    fetch(URL + i)
        .then((response) => response.json())
        .then(data => {
            todosLosPokemon.push(data);
            mostrarPokemon(data);
        })
}


function obtenerFavoritos() {
    const favoritos = localStorage.getItem('pokemonFavoritos');
    return favoritos ? JSON.parse(favoritos) : [];
}


function guardarFavoritos(favoritos) {
    localStorage.setItem('pokemonFavoritos', JSON.stringify(favoritos));
}


function esFavorito(pokemonId) {
    const favoritos = obtenerFavoritos();
    return favoritos.some(p => p.id === pokemonId);
}


function toggleFavorito(poke) {
    const favoritos = obtenerFavoritos();
    const existe = favoritos.findIndex(p => p.id === poke.id);
    
    if (existe !== -1) {

        favoritos.splice(existe, 1);
    } else {

        favoritos.push({
            id: poke.id,
            name: poke.name,
            sprites: poke.sprites,
            types: poke.types,
            height: poke.height,
            weight: poke.weight
        });
    }
    
    guardarFavoritos(favoritos);
    actualizarVista();
}

function mostrarPokemon(poke, mostrarBotonFavorito = true) {

    let tipos = poke.types.map((type) => `<p class="${type.type.name} tipo">${type.type.name}</p>`);
    tipos = tipos.join('');

    let pokeId = poke.id.toString();
    if (pokeId.length === 1) {
        pokeId = "00" + pokeId;
    } else if (pokeId.length === 2) {
        pokeId = "0" + pokeId;
    }

    const esFav = esFavorito(poke.id);
    const botonFavorito = mostrarBotonFavorito ? `
        <button class="btn-favorito ${esFav ? 'activo' : ''}" data-pokemon-id="${poke.id}">
            ${esFav ? '★' : '☆'}
        </button>
    ` : '';

    const div = document.createElement("div");
    div.classList.add("pokemon");
    div.innerHTML = `
        <p class="pokemon-id-back">#${pokeId}</p>
        <div class="pokemon-imagen">
            <img src="${poke.sprites.other["official-artwork"].front_default}" alt="${poke.name}">
        </div>
        <div class="pokemon-info">
            <div class="nombre-contenedor">
                <p class="pokemon-id">#${pokeId}</p>
                <h2 class="pokemon-nombre">${poke.name}</h2>
            </div>
            <div class="pokemon-tipos">
                ${tipos}
            </div>
            <div class="pokemon-stats">
                <p class="stat">${poke.height}m</p>
                <p class="stat">${poke.weight}kg</p>
            </div>
            ${botonFavorito}
        </div>
    `;
    

    if (mostrarBotonFavorito) {
        const btnFav = div.querySelector('.btn-favorito');
        btnFav.addEventListener('click', () => {
            const pokemonCompleto = todosLosPokemon.find(p => p.id === poke.id) || poke;
            toggleFavorito(pokemonCompleto);
        });
    }
    
    listaPokemon.append(div);
}


function filtrarPorNombre(nombre) {
    const nombreLower = nombre.toLowerCase().trim();
    listaPokemon.innerHTML = "";
    
    if (modoFavoritos) {
        const favoritos = obtenerFavoritos();
        favoritos.forEach(poke => {
            if (poke.name.toLowerCase().includes(nombreLower)) {
                mostrarPokemon(poke);
            }
        });
    } else {
        todosLosPokemon.forEach(poke => {
            if (poke.name.toLowerCase().includes(nombreLower)) {
                mostrarPokemon(poke);
            }
        });
    }
}


function actualizarVista() {
    const nombreBusqueda = inputBusqueda.value;
    
    if (modoFavoritos) {
        mostrarFavoritos();
    } else if (nombreBusqueda) {
        filtrarPorNombre(nombreBusqueda);
    } else {
        mostrarTodos();
    }
}


function mostrarTodos() {
    listaPokemon.innerHTML = "";
    todosLosPokemon.forEach(poke => mostrarPokemon(poke));
}


function mostrarFavoritos() {
    listaPokemon.innerHTML = "";
    const favoritos = obtenerFavoritos();
    
    if (favoritos.length === 0) {
        listaPokemon.innerHTML = '<p class="sin-resultados">No tienes pokemon favoritos aún.</p>';
        return;
    }
    
    favoritos.forEach(poke => mostrarPokemon(poke));
}


inputBusqueda.addEventListener('input', (e) => {
    const nombre = e.target.value;
    if (nombre) {
        filtrarPorNombre(nombre);
    } else {
        if (modoFavoritos) {
            mostrarFavoritos();
        } else {
            mostrarTodos();
        }
    }
});


btnMostrarFavoritos.addEventListener('click', () => {
    modoFavoritos = true;
    btnMostrarFavoritos.style.display = 'none';
    btnOcultarFavoritos.style.display = 'block';
    inputBusqueda.value = '';
    mostrarFavoritos();
});


btnOcultarFavoritos.addEventListener('click', () => {
    modoFavoritos = false;
    btnMostrarFavoritos.style.display = 'block';
    btnOcultarFavoritos.style.display = 'none';
    inputBusqueda.value = '';
    mostrarTodos();
});


botonesHeader.forEach(boton => boton.addEventListener("click", (event) => {
    const botonId = event.currentTarget.id;
    modoFavoritos = false;
    btnMostrarFavoritos.style.display = 'block';
    btnOcultarFavoritos.style.display = 'none';
    inputBusqueda.value = '';

    listaPokemon.innerHTML = "";

    for (let i = 1; i <= 151; i++) {
        fetch(URL + i)
            .then((response) => response.json())
            .then(data => {

                if(botonId === "ver-todos") {
                    mostrarPokemon(data);
                } else {
                    const tipos = data.types.map(type => type.type.name);
                    if (tipos.some(tipo => tipo.includes(botonId))) {
                        mostrarPokemon(data);
                    }
                }

            })
    }
}))
