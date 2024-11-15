class Modal{
  constructor(options){
    this.settings = {
      ...{
        title: "Color Picker",
        buttons: undefined,
        content: undefined,
        customClass: undefined,
        outsideClose: true,
        onClose: undefined,
        outsideClose: true,
        onOpen: undefined,
        width: 150,
        height: 100,
        autoOpen: true,
        overlayer: true
      },
      ...options,
    };
    //this.loadingContent = false;
    this.popupEl = null;

    console.log(this.settings)

    if (typeof this.settings.autoOpen != "undefined"){
      if (this.settings.autoOpen){
        console.log("world")
        this.open();
      }
    }
  }

  #buildModal() {
    return (
      `<div class="modal_ctn">` +
      `<div class="modal_innerctn">` +
      `<div class="content_ctn"></div>` +
      `<div class="btn_ctn"></div>` +
      `</div></div>`
    );
  }

  #loadContent(fallback) {
    if (this.popupEl != null){
      //this.loadingContent = true;
      var contentCtn = this.popupEl.getElementsByClassName("content_ctn");
      if( typeof this.settings.content == "string"){
        contentCtn[0].innerHTML = this.settings.content;
      }else if( typeof this.settings.content == "object"){
        contentCtn[0].appendChild(this.settings.content);
      }
      
      this.#loadButtons();

      if (typeof fallback == "function")fallback();
    }
  }

  #loadButtons() {
    var btnCtn = this.popupEl.getElementsByClassName("btn_ctn");

    if (
      typeof this.settings.buttons != "undefined" &&
      typeof this.settings.buttons == "object" &&
      this.settings.buttons.length > 0
    ) {
      this.settings.buttons.forEach((btn) => {
        var button = document.createElement('button')
        if(btn.tooltip != undefined){
            button.setAttribute('title') = btn.tooltip
        }

        if (btn.customClass != undefined){
            button.classList.appendChild(btn.customClass)
        }

        if(btn.title != undefined ){
            button.innerHTML =btn.title
        }

        btnCtn[0].appendChild(button)//  insertAdjacentHTML("beforeend", buttonHTML);
        if (typeof btn.click != "undefined")
            button.addEventListener("click", () => {
            btn.click(this);
          });
      });
    }
  }

  open() {
    var modal = this.#buildModal();
    var body = document.getElementsByTagName("body");
    body[0].insertAdjacentHTML("beforeend", modal);

    this.popupEl = body[0].lastChild;

    this.#loadContent(() => {
      console.log("world")
      if (typeof this.settings.onOpen == "function") {
        this.settings.onOpen(this);
      }
    });
  }

  close() {
    if (this.settings.onClose != undefined && typeof this.settings.onClose == "function") {
        this.settings.onClose();
    }
	    
    this.popupEl.remove();
  }
}

class ColorPicker{
  constructor(colorOp,elem){
    this.colorOp = {
      ...{
          hue: 0,
      saturation: 0.5,
      lightness: 0.5,
      showFill: true,
      opacity: 1
      }
      ,...colorOp
    };
    
    this.elem = elem;
    this.colortype = "hsl"

    this.slCanvas = document.createElement("canvas");
    this.slCtx = this.slCanvas.getContext("2d");
    this.slCanvas.width = 150;
    this.slCanvas.height = 150;
        
    this.outputCanvas = document.createElement("canvas");
    this.outputCanvas.width = 30;
    this.outputCanvas.height = 30;

    this.opacityControl = document.createElement('input')
    this.mainDiv = document.createElement('div')
    this.#buildContent()

    this.modal = new Modal({
      //content: this.mainDiv,
      autoOpen: false,
      onOpen:(modal)=>{
        console.log(modal)
        var contentCtn = modal.popupEl.getElementsByClassName("content_ctn");
        contentCtn[0].appendChild(this.mainDiv)
        this.#setColor()
        this.#addColorEvent()

      },
      buttons: [
        {
          title: "Apply",
          click: function (modal) {
            console.log("hello");
            console.log(modal);
            modal.close();
          },
        },
        {
          title: "Cancel",
          click: function (modal) {
            console.log("world");
            modal.close();
          },
        },
      ],
    })

    this.#init()
  }

  #init(){
    this.elem.addEventListener("click", (e)=>{
      this.modal.open()
    });
    console.log("hello")
  }

  #buildContent(){
    this.mainDiv.appendChild(this.slCanvas);
    this.mainDiv.appendChild(this.outputCanvas);
    this.#rangeInput()
    this.#NumberInput()
  }

  #rangeInput(elm){
    var hueControl = document.createElement('input')

    this.#setAttributes(hueControl, {
      id: "hueControl",
      max: "360",
      min: "0",
      step: "1",
      onchange: (e) => this.#changeHue(e.currentTarget.value),
      oninput: (e) => this.#changeHue(e.currentTarget.value, false),
      title: "Hue",
      type: "range",
      value: this.colorOp.hue,
    })

    this.#setAttributes(this.opacityControl, {
      id: "opacityControl",
      max: "1",
      min: "0",
      step: "0.1",
      onchange: (e) => this.#changeOpacity(e.currentTarget.value),
      oninput: (e) => this.#changeOpacity(e.currentTarget.value, false),
      title: "Opacity",
      type: "range",
      value: this.colorOp.opacity,
    })

    this.mainDiv.appendChild(hueControl);
    this.mainDiv.appendChild(this.opacityControl)
  }

  #NumberInput(){
    console.log("hello")
    var divcont  = document.createElement('div')
    var label1 = document.createElement('label')
    var label2 = document.createElement('label')
    var label3 = document.createElement('label')
    
    divcont.appendChild(label1);
    divcont.appendChild(label2);
    divcont.appendChild(label3);

    divcont.classList.add("3-col")
    if(this.colortype = "hsl"){
      var Hinput = document.createElement('input')
      var Sinput = document.createElement('input')
      var Linput = document.createElement('input')
      this.#setAttributes(Hinput, {
        id: "HInput",
        title: "H",
        max: "360",
        min: "0",
        step: "1",
        type: "number",
        value: this.colorOp.hue,
        onchange: (e) => this.#changeHue(e.currentTarget.value),
      oninput: (e) => this.#changeHue(e.currentTarget.value, false),
      })

      this.#setAttributes(Sinput, {
        id: "SInput",
        title: "S",
        max: "100",
        min: "0",
        step: "1",
        type: "number",
        value: this.colorOp.saturation * 100,
        onchange: (e) => this.#changeSat(e.currentTarget.value),
        oninput: (e) => this.#changeSat(e.currentTarget.value, false),
      })

      this.#setAttributes(Linput, {
        id: "LInput",
        title: "L",
        max: "100",
        min: "0",
        step: "1",
        type: "number",
        value: this.colorOp.lightness * 100,
        onchange: (e) => this.#changeLight(e.currentTarget.value),
        oninput: (e) => this.#changeLight(e.currentTarget.value, false),
      })

      label1.appendChild(Hinput);
      label2.appendChild(Sinput);
      label3.appendChild(Linput);
    }

    this.mainDiv.appendChild(divcont);
  }

  #setAttributes(elm, attributes){
    if (attributes) {
		  Object.entries(attributes).forEach(([key, value]) => {
			  if (key.indexOf("on") === 0) {
				  elm.addEventListener(key.substring(2), value);
			  } else {
				  elm.setAttribute(key, value);
			  }
		  });
	  }
  }

  #showOutputColor(hue, saturation, lightness, opacity, showFill, canvas) {
    const ctx = canvas.getContext("2d");
    if (showFill) {
      console.log(`hsla(${hue}, ${saturation * 100}%, ${lightness * 100}%, ${opacity})`)
      ctx.fillStyle = `hsla(${hue}, ${saturation * 100}%, ${lightness * 100}%, ${Number(opacity)})`;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    } else {
      ctx.fillStyle = "white";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.strokeStyle = "red";
      ctx.lineWidth = 2;
      ctx.moveTo(0, 0);
      ctx.lineTo(canvas.width, canvas.height);
      ctx.stroke();
    }
  }

  #changeOpacity(value){
    this.colorOp.opacity = value;
    this.#setColor()
  }

  #changeHue(value, save = true) {
    var newVal = (value < 0)? value % 360 : (value > 360)? value % 360 : (value == "")? 0 : value
    console.log(newVal)
    
    this.colorOp.hue = newVal;
    this.#setColor()
  }

  #changeSat(value){
    var newVal = (value < 0)? value % 100 : (value > 100)? value % 100 : (value == "")? 0: value
    this.colorOp.saturation = newVal / 100;
    this.#setColor()
  }

  #changeLight(value){
    var newVal = (value < 0)? value % 100 : (value > 100)? value % 100 : (value == "")? 0: value
    this.colorOp.lightness = newVal / 100;
    this.#setColor()
  }

  #setColor(){
    this.#generateSLGradient(this.colorOp.hue, this.slCtx);
    this.#showOutputColor(
        this.colorOp.hue,
      this.colorOp.saturation,
      this.colorOp.lightness,
      this.colorOp.opacity,
      this.colorOp.showFill,
      this.outputCanvas
    );

    this.opacityControl.style.background = "linear-gradient(to right, transparent, "+this.getFill()+")";
    this.#setInputVal()
  }

  #setInputVal(){
    if(this.colortype = "hsl"){
      HInput.value = this.colorOp.hue;
      SInput.value = this.colorOp.saturation * 100;
      LInput.value = this.colorOp.lightness * 100;
    }
  }

  getFill(){
    if(this.colorOp.showFill){
       return `hsl(${this.colorOp.hue}, ${this.colorOp.saturation * 100}%, ${this.colorOp.lightness * 100}%)`;
    }else{
       return null;
    }
  }

  #addColorEvent(){
    this.slCanvas.addEventListener("pointerdown", (e) => {
        const updateSL = (e) => this.#updateSL(e);
     updateSL(e);
        this.slCanvas.addEventListener("pointermove", updateSL);
        this.slCanvas.addEventListener("pointerup", () => {
            this.slCanvas.removeEventListener("pointermove", updateSL);
        });
    });
  }

  #updateSL(e) {
    const x = e.offsetX;
    const y = e.offsetY;
    this.colorOp.saturation = x / this.slCanvas.width;
    const lightnessDecreaseFactor = 1 - (0.5 * x) / this.slCanvas.width;
    this.colorOp.lightness =
        1 -
        0.5 * (x / this.slCanvas.width) ** 1 -
        (y / this.slCanvas.height) * lightnessDecreaseFactor;

    this.#setColor()
  }

  #generateSLGradient(hue, ctx) {
    const { width, height } = ctx.canvas;

    // To-Do speedup this
    const stepSize = 2;
    for (let x = 0; x < width; x += stepSize) {
      for (let y = 0; y < height; y += stepSize) {
        const saturation = x / width;
        const lightnessDecreaseFactor = 1 - (0.5 * x) / width;
        const lightness =
          1 - 0.5 * (x / width) ** 1 - (y / height) * lightnessDecreaseFactor;
        ctx.fillStyle = `hsl(${hue}, ${saturation * 100}%, ${
          lightness * 100
        }%)`;
        ctx.fillRect(x, y, stepSize, stepSize);
      }
    }

    // Warning, inverting the formula must be done again if we change it
    const dotX = this.colorOp.saturation * width;
    const lightnessDecreaseFactor = 1 - (0.5 * dotX) / width;
    const dotY =
      (-(this.colorOp.lightness - 1 + 0.5 * (dotX / width) ** 1) /
        lightnessDecreaseFactor) *
      height;

    ctx.strokeStyle = "white";
    ctx.beginPath();
    ctx.arc(dotX, dotY, 5, 0, 2 * Math.PI);
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.strokeStyle = "black";
    ctx.lineWidth = 1;
    ctx.stroke();
  }
}

class ColorConvertor{
  static hslToRgb(h, s, l) {
    s /= 100;
    l /= 100;
  
    const c = (1 - Math.abs(2 * l - 1)) * s;
    const x = c * (1 - Math.abs((h / 60) % 2 - 1));
    const m = l - c / 2;
    
    let r = 0, g = 0, b = 0;
  
    if (0 <= h && h < 60) { r = c; g = x; b = 0; }
    else if (60 <= h && h < 120) { r = x; g = c; b = 0; }
    else if (120 <= h && h < 180) { r = 0; g = c; b = x; }
    else if (180 <= h && h < 240) { r = 0; g = x; b = c; }
    else if (240 <= h && h < 300) { r = x; g = 0; b = c; }
    else if (300 <= h && h < 360) { r = c; g = 0; b = x; }
  
    r = Math.round((r + m) * 255);
    g = Math.round((g + m) * 255);
    b = Math.round((b + m) * 255);
  
    return { r, g, b };
  }

  static rgbToHex(r, g, b) {
    return "#" + [r, g, b].map(x => {
        const hex = x.toString(16);
        return hex.length === 1 ? "0" + hex : hex;
    }).join("");
  }

  static hslToHex(h, s, l) {
    const { r, g, b } = ColorConvertor.hslToRgb(h, s, l);
    return ColorConvertor.rgbToHex(r, g, b);
  }

  static rgbToHsl(r, g, b) {
    r /= 255;
    g /= 255;
    b /= 255;
  
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const delta = max - min;
  
    let h = 0, s = 0, l = (max + min) / 2;
  
    if (delta !== 0) {
        s = l > 0.5 ? delta / (2 - max - min) : delta / (max + min);
        switch (max) {
            case r: h = ((g - b) / delta + (g < b ? 6 : 0)); break;
            case g: h = ((b - r) / delta + 2); break;
            case b: h = ((r - g) / delta + 4); break;
        }
        h *= 60;
    }
  
    return { h: Math.round(h), s: Math.round(s * 100), l: Math.round(l * 100) };
  }

  static hexToRgb(hex) {
    hex = hex.replace("#", "");
    if (hex.length === 3) {
        hex = hex.split("").map(c => c + c).join("");
    }
  
    const bigint = parseInt(hex, 16);
    return {
        r: (bigint >> 16) & 255,
        g: (bigint >> 8) & 255,
        b: bigint & 255
    };
  }

  static hexToHsl(hex) {
    const { r, g, b } = ColorConvertor.hexToRgb(hex);
    return ColorConvertor.rgbToHsl(r, g, b);
  }
} 

new ColorPicker(
  {},
  document.getElementById("color_Picker")
);