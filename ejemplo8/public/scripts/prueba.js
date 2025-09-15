<script>
function closeOverlay() {
    const overlay = document.getElementById('overlayPanel');
    overlay.style.transform = 'translateX(100%)'; // Oculta el panel deslizándolo fuera de la vista
}
function abrirOverlay(){
    const overlay = document.getElementById('overlayPanel');
    overlay.style.transform = 'translateX(0%)'; // aparece el panel deslizándolo a la vista
}
/*
export default {
  data() {
    return {
      inputValue: '', // Estado para almacenar el valor del input
    };
  },
};*/
export default {
  data() {
    return {
      sliders: [
        { value: 0, min: 0, max: 360, step: 10 }, // Slider 1
        { value: 90, min: 0, max: 180, step: 10 },  // Slider 2
        { value: 90, min: 0, max: 180, step: 10 }, // Slider 3
        { value: 90, min: 0, max: 180, step: 10 }, // Slider 4
      ],
    };
  },
};

</script>