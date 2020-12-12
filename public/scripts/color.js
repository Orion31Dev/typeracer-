const spDefColor = document.querySelector('body').style.getPropertyValue('--accent');

let sliderPicker = new iro.ColorPicker("#hue-color", {
  width: 500,
  color: spDefColor,
  borderWidth: 0,
  borderColor: "#fff",
  layout: [
    {
      component: iro.ui.Slider,
      options: {
        sliderType: 'hue'
      }
    }]
});

sliderPicker.on('color:change', function(color) {
  document.querySelector('body').style.setProperty('--accent', color.hexString);
  setCookie('accent', color.hexString, 1);
});