<script setup>
///////////////////////////////LIBRERIAS//////////////////////////////////////////////////////////////////
import AppLayout from '@/Layouts/AppLayout.vue';
import Welcome from '@/Components/Welcome.vue';
import { ref, onMounted,watch,computed } from 'vue';
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
/////////////////////////////////////////Escena///////////////////////////////////////////////////////////
function closeOverlay() {
    const overlay = document.getElementById('overlayPanel');
    overlay.style.transform = 'translateX(100%)'; // Oculta el panel deslizándolo fuera de la vista
}
function abrirOverlay(){
    const overlay = document.getElementById('overlayPanel');
    overlay.style.transform = 'translateX(0%)'; // aparece el panel deslizándolo a la vista
}
//////////////////////////////////////////////////////////////////////////////////////////////////////////
const target = ref();
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xabcdef);
// luz ambiental
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5); // Luz blanca con intensidad 0.5
scene.add(ambientLight);
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 0.08;
camera.position.y = -0.8;
camera.position.x = 0.00;
//////////preparacion de modelo 3d ////////////////////////////////////////////////////////////////////////
const renderer = new THREE.WebGLRenderer();
renderer.setSize(1350,520);//520
document.body.appendChild(renderer.domElement);
// Inicializar controles de órbita después de la cámara y el renderizador
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true; // Habilita amortiguación para un movimiento más fluido
controls.dampingFactor = 0.05; // Ajusta la velocidad de amortiguación
controls.rotateSpeed = 0.5; // Ajusta la sensibilidad de rotación
controls.enableRotate = false;  // Desactiva la rotación con el mouse
//////////////////////////// Parte numerica Denavit Hartemberg /////////////////////////////////////////////
// Parámetros del brazo robótico (longitudes de los eslabones)
// Evento para mostrar las coordenadas de la cámara cuando los controles cambian
/* controls.addEventListener('change', () => {
    console.log(`Posición de la cámara: x=${camera.position.x.toFixed(2)}, y=${camera.position.y.toFixed(2)}, z=${camera.position.z.toFixed(2)}`);
});  */
const l1 = 0.12*0;
const l2 = 0.24;
const l3 = 0.03;
const l4 = 0.28;

// Variables para los sliders
const q1Angle = ref(0);
const q2Angle = ref(0);
const q3Angle = ref(0);
//const ang4=q3Angle+90;

// Cargar el modelo GLB
let robot;
const loader = new GLTFLoader();
loader.load('models/glb/brazo_v25_G.glb', function (gltf) {
    robot = gltf.scene;
    scene.add(robot);
    //robot.rotation.x=Math.PI/2;
    texture.flipY = false;

}, undefined, function (error) {
    console.error(error);
});
// Crear una matriz de transformación usando los parámetros DH
// Función para crear una matriz de transformación DH
function dhMatrix(alpha, a, d, theta) {
    const cosTheta = Math.cos(theta);
    const sinTheta = Math.sin(theta);
    const cosAlpha = Math.cos(alpha);
    const sinAlpha = Math.sin(alpha);

    return new THREE.Matrix4().set(
        cosTheta, -sinTheta, 0, a,
        sinTheta * cosAlpha, cosTheta * cosAlpha, -sinAlpha, -sinAlpha * d,
        sinTheta * sinAlpha, cosTheta * sinAlpha, cosAlpha, cosAlpha * d,
        0, 0, 0, 1
    );
}
// Función para aplicar la matriz DH a un eslabón
function applyDHTransform(eslabon, dhMatrix,origen) {
    const x=dhMatrix.elements[0+4*3]+origen.x;
    const y=dhMatrix.elements[1+4*3]+origen.y;
    const z=dhMatrix.elements[2+4*3]+origen.z;
    eslabon.setRotationFromMatrix(dhMatrix);
    eslabon.position.set(x,y,z);
}
// Función para actualizar el brazo robótico según los ángulos de los sliders
function updateRobot() {
    if (!robot) return;  // Verificar si el modelo ha sido cargado

    // Leer los ángulos de los sliders (convertir a radianes)
    const q1 = THREE.MathUtils.degToRad(q1Angle.value);
    const q2 = THREE.MathUtils.degToRad(q2Angle.value);
    const q3 = THREE.MathUtils.degToRad(q3Angle.value);

    // Matrices de transformación DH
    const H_0_1 = dhMatrix(0, 0, l1, q1);
    const H_1_2 = dhMatrix(Math.PI / 2, 0, 0, q2 + Math.PI / 2);
    const H_2_3 = dhMatrix(0, l2, 0, -Math.PI / 2);
    const H_3_4 = dhMatrix(0, l3, 0, q3);
    const H_4_5 = dhMatrix(0, l4, 0, 0);
    // Matrices acumulativas
    const H_0_2 = new THREE.Matrix4().multiplyMatrices(H_0_1, H_1_2);
    const H_0_3 = new THREE.Matrix4().multiplyMatrices(H_0_2, H_2_3);
    const H_0_4 = new THREE.Matrix4().multiplyMatrices(H_0_3, H_3_4);
    const H_0_5 = new THREE.Matrix4().multiplyMatrices(H_0_4, H_4_5);

    // Aplicar las transformaciones a los eslabones del robot
    const base = robot.getObjectByName('Base');
    const eslabon0 = robot.getObjectByName('Eslabon0');
    const eslabon1 = robot.getObjectByName('Eslabon1');
    const eslabon2 = robot.getObjectByName('Eslabon2');
    const origen=eslabon0.position.clone();// nuevo origen del robot

    if (eslabon0) applyDHTransform(eslabon0, H_0_1,origen);
    if (eslabon1) applyDHTransform(eslabon1, H_0_2,origen);
    if (eslabon2) applyDHTransform(eslabon2, H_0_4,origen);

    // Asegurarse de que se aplique la transformación
    robot.updateMatrixWorld(true);
}
// Función de animación
function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
}
// Inicializar la escena y el robot al montar el componente
onMounted(() => {
    target.value.appendChild(renderer.domElement);
    animate();
    updateRobot();
});
// Observadores para los sliders
watch([q1Angle, q2Angle, q3Angle], () => {
    updateRobot();  // Llamar a la función para actualizar el robot

});

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
import axios from "axios";

const ip = "192.168.4.1"; // IP del robot
const responseText = ref("");
const command = ref(""); // Entrada para el usuario

// Variables para automatización
const isAutomating = ref(false);
const currentCycle = ref(0);
const maxCycles = ref(5);
const updateCommand = () => {
  command.value = JSON.stringify({
    T: 122,
    b: q1Angle.value, // Aquí se usa el valor de q1Angle
    s: q2Angle.value*(-1), // Puedes agregar más valores según lo necesites/////calibrada
    e: parseInt(q3Angle.value)*(-1)+90,//calibrado y parseado 
    h: 180,
    spd: 10,
    acc: 10
  }, null, 2);
  console.log("JSON actualizado:", command.value); // Ver en consola
};
// Observar cambios en los sliders y actualizar `command`
watch([q1Angle, q2Angle, q3Angle], updateCommand, { immediate: true });

const sendCommand2 = (event)=>{
    command.value= JSON.stringify({
        T:114,
        led:255
    })
    const url = `http://${ip}/js?json=${encodeURIComponent(command.value)}`;
    event.preventDefault();
    const response =  axios.get(url);
    responseText.value = response.data; // Muestra la respuesta del robot
}

const sendCommand3 = (event)=>{
    command.value= JSON.stringify({

        T:115,
        spd: 10,
        acc: 10
        
    })
    const url = `http://${ip}/js?json=${encodeURIComponent(command.value)}`;
    event.preventDefault();
    const response =  axios.get(url);
    responseText.value = response.data; // Muestra la respuesta del robot
}

const sendCommand4 = async ()=>{
    // Actualizar robot virtual a posición home
    q1Angle.value = 0;
    q2Angle.value = 0;
    q3Angle.value = 0;
    
    command.value= JSON.stringify({
        T:100
    })
    const url = `http://${ip}/js?json=${encodeURIComponent(command.value)}`;
    const response =  axios.get(url);
    responseText.value = response.data;
}
//////////////////////////////////////////////////////////////////////////////////////////////
// Botón para enviar comando de abrir pinza
const sendCommand5 = (event)=>{
    command.value= JSON.stringify({

        T:122,
        b: q1Angle.value, // Aquí se usa el valor de q1Angle
        s: q2Angle.value*(-1), // Puedes agregar más valores según lo necesites/////calibrada
        e: parseInt(q3Angle.value)*(-1)+90,//calibrado y parseado 
        h:90
        
        
    })
    const url = `http://${ip}/js?json=${encodeURIComponent(command.value)}`;
    event.preventDefault();
    const response =  axios.get(url);
    responseText.value = response.data; // Muestra la respuesta del robot
}
//Botón para enviar comando de cerrar pinza 
const sendCommand6 = (event)=>{
    command.value= JSON.stringify({

        T:122,
        b: q1Angle.value, // Aquí se usa el valor de q1Angle
        s: q2Angle.value*(-1), // Puedes agregar más valores según lo necesites/////calibrada
        e: parseInt(q3Angle.value)*(-1)+90,//calibrado y parseado 
        h:180
        
        
    })
    const url = `http://${ip}/js?json=${encodeURIComponent(command.value)}`;
    event.preventDefault();
    const response =  axios.get(url);
    responseText.value = response.data; // Muestra la respuesta del robot
   
}
/////////////////////////////////////////////////////////////////////////////////////////////////////
// Función para enviar comandos JSON al robot
const sendCommand =  (event) => {
  //if (!command.value) return; // Evita enviar si el campo está vacío

  const url = `http://${ip}/js?json=${encodeURIComponent(command.value)}`;

  try {
    event.preventDefault();
    const response =  axios.get(url);
    responseText.value = response.data; // Muestra la respuesta del robot
  } catch (error) {
    responseText.value = "Error en la comunicación.";
    console.error(error);
  }
};

// Función para mover el robot a la posición del Punto C
const goToPositionC = () => {
    q1Angle.value = 180;
    q2Angle.value = 45;
    q3Angle.value = -80;
    
    updateCommand(); 
    
    const fakeEvent = { preventDefault: () => {} }; 
    sendCommand(fakeEvent);
};

// Función para mover el robot a la nueva secuencia
const goToCustomPosition = () => {
    q1Angle.value = -54;
    q2Angle.value = -14;
    q3Angle.value = -33;
    
    updateCommand(); 
    
    const fakeEvent = { preventDefault: () => {} }; 
    sendCommand(fakeEvent);
};

// Función para ir a posición home
const goToHome = () => {
    q1Angle.value = 0;
    q2Angle.value = 0;
    q3Angle.value = 0;
    
    updateCommand();
    
    const fakeEvent = { preventDefault: () => {} };
    sendCommand(fakeEvent);
};

// Función de automatización
const startAutomation = () => {
    if (isAutomating.value) return;
    
    isAutomating.value = true;
    currentCycle.value = 0;
    responseText.value = "Iniciando automatización...";
    
    const runCycle = () => {
        if (currentCycle.value >= maxCycles.value) {
            isAutomating.value = false;
            responseText.value = `Automatización completada. ${maxCycles.value} ciclos realizados.`;
            return;
        }
        
        currentCycle.value++;
        responseText.value = `Ciclo ${currentCycle.value}/${maxCycles.value} - Moviendo a posición personalizada...`;
        
        // Ir a posición personalizada
        goToCustomPosition();
        
        // Después de 5 segundos, ir a home
        setTimeout(() => {
            if (!isAutomating.value) return;
            responseText.value = `Ciclo ${currentCycle.value}/${maxCycles.value} - Regresando a home...`;
            goToHome();
            
            // Después de 5 segundos más, siguiente ciclo
            setTimeout(() => {
                if (!isAutomating.value) return;
                runCycle();
            }, 5000);
        }, 5000);
    };
    
    runCycle();
};

// Función para detener automatización
const stopAutomation = () => {
    isAutomating.value = false;
    responseText.value = "Automatización detenida.";
};

</script>
<template>
    <AppLayout title="ROBOT">
        <nav class="bg-[#15803d] shadow-lg p-4 flex justify-between items-center">
            <div class="text-xl text-gray-100">Proyecto Brazo Dragón</div>
            <div class="flex items-center space-x-4">
                <button id="openButton" @click.left="()=>abrirOverlay()" class="text-gray-300 hover:text-gray-100 focus:outline-none">
                    <!-- Hamburger Icon (SVG) -->
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16m-7 6h7"></path>
                    </svg>
                </button>
            </div>
        </nav>
        <div class="flex-grow h-full flex items-center justify-center bg-white">
            <div id="scene-container" class="w-full h-full">
                <div ref="target"></div>
            </div>
        </div>
        <div id="overlayPanel" class="fixed top-0 right-0 w-1/4 h-full overflow-y-auto bg-white shadow-lg transform transition-transform duration-300">
            <button id="closeButton" @click.left="()=>closeOverlay()"
                class="text-xl absolute top-4 right-4 text-gray-500 hover:text-gray-700">×
                
            </button>
            <div class="bg-white rounded px-8 pt-6 pb-8 mb-4">
                <h2 class="text-2xl font-bold mb-6 text-center">Proyecto Brazo de Dragon</h2>
                    <div class="mb-4">
                        <div class="control-panel">
                            <label>
                                Articulación 1 (q1):
                                <input type="range" v-model="q1Angle" min="-180" max="180" step="1" />
                                {{ q1Angle }}°
                            </label>
                            <br />
                            <label>
                                Articulación 2 (q2):
                                <input type="range" v-model="q2Angle" min="-90" max="90" step="1" />
                                {{ q2Angle }}°
                            </label>
                            <br />
                            <label>
                                Articulación 3 (q3):
                                <input type="range" v-model="q3Angle" min="-90" max="90" step="1" />
                                {{ q3Angle }}°
                            </label>
                        </div>
                    </div>
                    <div class="mb-4">
                        
                        <h1>Control del Robot</h1>

                        <label>Comando JSON:</label>
                        <textarea class="textarea-grande" v-model="command" type="text" readonly />

                        <button class="boton" @click="sendCommand"><pre>    Enviar comando    </pre></button>

                        <h3>Respuesta del Robot:</h3>
                        <pre>{{ responseText }}</pre>
                    </div>
                    <div class="mb-4">
                    

                        <button class="boton" @click="sendCommand2"><pre>    encencer led    </pre></button>
                        <br>
                        <br>

                        <button class="boton2" @click="sendCommand3"><pre>    apagar led    </pre></button>
                        <br>
                        <br>
                        <button class="boton2" @click="sendCommand4"><pre>    Home   </pre></button>
                        <br><br>
                        <button class="boton2" @click="sendCommand5"><pre>    garra abre   </pre></button>
                        <br><br>
                        <button class="boton2" @click="sendCommand6"><pre>    garra cierra  </pre></button>
                        <br><br>
                        
                        <!-- Controles de Automatización -->
                        <div class="automation-controls">
                            <h3>Automatización</h3>
                            <div class="mb-2">
                                <label>Ciclos a repetir:</label>
                                <input type="number" v-model="maxCycles" min="1" max="50" :disabled="isAutomating" class="w-16 ml-2 px-2 py-1 border rounded" />
                            </div>
                            <button 
                                class="boton" 
                                @click="startAutomation" 
                                :disabled="isAutomating"
                                :class="{ 'opacity-50': isAutomating }"
                            >
                                <pre>{{ isAutomating ? '  Ejecutando...  ' : '  Iniciar Auto  ' }}</pre>
                            </button>
                            <br><br>
                            <button 
                                class="boton2" 
                                @click="stopAutomation" 
                                :disabled="!isAutomating"
                                :class="{ 'opacity-50': !isAutomating }"
                            >
                                <pre>  Detener Auto  </pre>
                            </button>
                            <br><br>
                            <div v-if="isAutomating" class="text-sm text-blue-600">
                                Ciclo actual: {{ currentCycle }}/{{ maxCycles }}
                            </div>
                        </div>
                        <br><br>
                        
                        <div class="image-buttons-row">
                            <div class="image-button-container" @click="goToPositionC" title="Ángulos: 0°, 45°, -90°">
                                <img src="models/movimiento1.png" alt="Punto C" class="position-image" />
                                <p>Secuencia de movimientos A</p>
                            </div>
                            <div class="image-button-container" @click="goToCustomPosition" title="Ángulos: -54°, -14°, -33°">
                                <img src="models/movimiento2.png" alt="Secuencia Personalizada" class="position-image" />
                                <p>Secuencia de movimientos B






                                </p>
                            </div>
                        </div>

                        
                        <pre>{{ responseText }}</pre>
                    </div>

                    
            </div>
        </div>   
        
      
    </AppLayout>  
</template>
<style>
.control-panel {
    
    top: 10px;
    left: 10px;
    background-color: rgba(255, 255, 255, 0.8);
    padding: 10px;
    border-radius: 4px;

}
.boton {
    background-color: rgb(59, 133, 245);
    border: solid;
    border-radius: 10px;
}
.boton2 {
    background-color: rgb(59, 133, 245);
    border: solid;
    border-radius: 10px;
}
.boton:hover{
    background-color: rgb(86, 240, 81);
   
}
.boton2:hover{
    background-color: rgb(249, 238, 97);
   
}
.textarea-grande {
        width: 80%;
        height: 250px;
    }
pre{
    font-family: 'Gill Sans', 'Gill Sans MT', Calibri, 'Trebuchet MS', sans-serif;
    font-size: 20px;
}
.image-buttons-row {
    display: flex;
    gap: 10px;
    width: 100%;
}
.image-button-container {
    cursor: pointer;
    text-align: center;
    padding: 5px;
    border: 2px solid #3b85f5;
    border-radius: 10px;
    background-color: #f0f8ff;
    transition: all 0.3s ease;
    width: 50%;
    margin: 0;
}
.image-button-container:hover {
    background-color: #e6f3ff;
    border-color: #2563eb;
    transform: scale(1.05);
}
.position-image {
    width: 120px;
    height: 80px;
    object-fit: cover;
    border-radius: 5px; 
    margin-bottom: 5px;
}
.image-label {
    display: block;
    font-size: 12px;
    font-weight: bold;
    color: #333;
}

/* Telefonos movil (320px - 768px) */
@media (max-width: 768px) {
    #overlayPanel {
        width: 100%;
        transform: translateX(100%);
    }
    .image-buttons-row {
        flex-direction: column;
    }
    .image-button-container {
        width: 100%;
        margin-bottom: 10px;
    }
    .position-image {
        width: 80px;
        height: 60px;
    }
    .boton, .boton2 {
        width: 100%;
        margin-bottom: 10px;
    }
    .textarea-grande {
        width: 95%;
        height: 150px;
    }
    pre {
        font-size: 16px;
    }
}

/* Tablet (769px - 1024px) */
@media (min-width: 769px) and (max-width: 1024px) {
    #overlayPanel {
        width: 40%;
    }
    .textarea-grande {
        width: 90%;
        height: 200px;
    }
    .position-image {
        width: 100px;
        height: 70px;
    }
    .boton, .boton2 {
        font-size: 16px;
    }
}

/* Escritorio (1025px - 1440px) */
@media (min-width: 1025px) and (max-width: 1440px) {
    #overlayPanel {
        width: 30%;
    }
    .position-image {
        width: 120px;
        height: 80px;
    }
}

/* Pantallas grandes de escritorio (1441px+) */
@media (min-width: 1441px) {
    #overlayPanel {
        width: 25%;
    }
    .position-image {
        width: 140px;
        height: 90px;
    }
    .boton, .boton2 {
        font-size: 18px;
    }
    pre {
        font-size: 22px;
    }
}
</style>