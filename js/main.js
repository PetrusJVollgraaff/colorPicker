class Modal{
  constructor(options){
    this.settings = {
      ...{
        title: "Modal",
        buttons: undefined,
        content: undefined,
        customClass: undefined,
        outsideClose: true,
        onClose: undefined,
        onOpen: undefined,
        width: 150,
        height: 100,
        autoOpen: true,
        overlayer: true
      },
      ...options,
    };
    this.popupEl = null;

    this.OutsideClick = this.#outsideClickListener.bind(this)

    if (typeof this.settings.autoOpen != "undefined"){
      if (this.settings.autoOpen){
        this.open();
      }
    }
  }

  #buildModal() {
    this.CtnDiv = document.createElement('div')
    const InnerCtnDiv = document.createElement('div') 
    const ContentDiv = document.createElement('div') 
    const BtnDiv = document.createElement('div') 
    if(this.settings.customClass != undefined){
      CtnDiv.classList.add(this.settings.customClass)
    }
    
    this.CtnDiv.classList.add("modal_ctn")
    InnerCtnDiv.classList.add("modal_innerctn")
    ContentDiv.classList.add("content_ctn")
    BtnDiv.classList.add("btn_ctn")
    
    this.CtnDiv.appendChild(InnerCtnDiv)
    InnerCtnDiv.appendChild(ContentDiv)
    InnerCtnDiv.appendChild(BtnDiv)
  }

  #loadContent(fallback) {
    if (this.popupEl != null){
      var contentCtn = this.popupEl.getElementsByClassName("content_ctn");
      
      switch(typeof this.settings.content){
        case "string": contentCtn[0].innerHTML = this.settings.content; break;
        case "string": contentCtn[0].appendChild(this.settings.content); break;
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
            button.classList.add(btn.customClass)
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
    this.#buildModal();
    const body = document.getElementsByTagName("body");
    if(this.settings.overlayer){
        this.OverDiv = createDOMElement('div', {
            class:"overlay",
            onclick: this.settings.outsideClose && this.settings.overlayer? this.close.bind(this) :"" 
        })
        this.OverDiv.appendChild(this.CtnDiv);
        body[0].appendChild(this.OverDiv);
      }else{
        body[0].appendChild(this.CtnDiv);
        this.#EventListener()
      }

    this.popupEl = body[0].lastChild;

    this.#loadContent(() => {
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

  #EventListener(){
    if(!this.settings.overlayer){
      document.addEventListener('click', this.OutsideClick);
    }
  }

  #outsideClickListener(e){
    if(!e.target.closest('.modal_ctn') && e.target != this.elem){
      this.close()
    }
  }
}

class ColorPicker{
  Inputs = {
    hsl : [
      {
        id: "HInput",
        title: "H",
        max: "360",
        min: "0",
        step: "1",
        type: "number",
        onchange: (e) => this.#changeHue(e.currentTarget.value),
      oninput: (e) => this.#changeHue(e.currentTarget.value, false),
      },{
        id: "SInput",
        title: "S",
        max: "100",
        min: "0",
        step: "1",
        type: "number",
        onchange: (e) => this.#changeSat(e.currentTarget.value),
        oninput: (e) => this.#changeSat(e.currentTarget.value, false),
      },{
        id: "LInput",
        title: "L",
        max: "100",
        min: "0",
        step: "1",
        type: "number",
        onchange: (e) => this.#changeRGB("r", e.currentTarget.value),
				oninput: (e) => this.#changeRGB("r", e.currentTarget.value, false),
      }
    ],

    rgb : [
      {
        id: "RInput",
        title: "R",
        max: "255",
        min: "0",
        step: "1",
        type: "number",
        onchange: (e) => this.#changeRGB("g", e.currentTarget.value),
				oninput: (e) => this.#changeRGB("g", e.currentTarget.value, false),
      },{
        id: "GInput",
        title: "G",
        max: "255",
        min: "0",
        step: "1",
        type: "number",
        onchange: (e) => this.#changeRGB("g", e.currentTarget.value),
				oninput: (e) => this.#changeRGB("g", e.currentTarget.value, false),
      },{
        id: "BInput",
        title: "B",
        max: "255",
        min: "0",
        step: "1",
        type: "number",
        onchange: (e) => this.#changeRGB("b", e.currentTarget.value),
				oninput: (e) => this.#changeRGB("b", e.currentTarget.value, false),
      }
    ],

    hex : [
      ,{
        id: "HexInput",
        title: "Hex",
        type: "text",
        pattern: "^#(?:[0-9a-fA-F]{3,4}){1,2}$",
        onchange: (e) => this.#setHexValue('new',e.currentTarget.value),
        oninput: (e) => this.#setHexValue('new',e.currentTarget.value, false),
      }
    ]
  }
  
  
  constructor(elem, hexvalue){
    this.colorOp = {
      showFill: true,
      hex: hexvalue
    };
    
    this.elem = elem;
    this.colortype = "hsl"
    
    this.#setHSL_RGB()

    this.slCanvas = document.createElement("canvas");
    this.slCtx = this.slCanvas.getContext("2d");
    this.slCanvas.width = 150;
    this.slCanvas.height = 150;
        
    this.outputCanvas = document.createElement("div");
    this.outputCanvas.classList.add("color_prev")

    this.opacityControl = document.createElement('input')
    this.mainDiv = document.createElement('div')
    this.#buildContent()

    this.modalshow=false

    this.modal = new Modal({
      title: "Color Picker",
      autoOpen: false,
      onOpen:(modal)=>{
        var contentCtn = modal.popupEl.getElementsByClassName("content_ctn");
        contentCtn[0].appendChild(this.mainDiv)
        this.#addColorEvent()
        this.#setColor()

      },
      buttons: [
        {
          title: "Apply",
          click: (modal)=> {
            this.elem.style.background = `hsla(${this.colorOp.hsl.h}, ${this.colorOp.hsl.s}%, ${this.colorOp.hsl.l}%, ${Number(this.colorOp.hsl.a)})`
            modal.close();
          },
        },
        {
          title: "Cancel",
          click: function (modal) {
            modal.close();
          },
        },
      ],
    })

    this.#init()
  }

  #init(){
    this.elem.addEventListener("click", (e)=>{
      var action = (!this.modalshow)? "open" : "close"
      this.modal[action]()
      this.modalshow = !this.modalshow
    });
  }

  #buildContent(){
    this.mainDiv.appendChild(this.slCanvas);
    this.mainDiv.appendChild(this.outputCanvas);
    this.#rangeInput()
    this.#SelectElm()
    this.#NumberInput()
  }

  #rangeInput(){
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
      value: this.colorOp.hsl.h,
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
      value: this.colorOp.hsl.a,
    })

    this.mainDiv.appendChild(hueControl);
    this.mainDiv.appendChild(this.opacityControl)
  }

  #NumberInput(){
    this.divcont  = document.createElement('div')
    if(this.colortype != "hex"){
      this.divcont.classList.add("col_3")
    }
    
    const inputs = this.Inputs[this.colortype]

    inputs.forEach((input)=>{
      var labelElm = document.createElement('label')
      var inputElm = document.createElement('input')
          
      this.divcont.appendChild(labelElm);
      labelElm.appendChild(inputElm);
      
      this.#setAttributes(inputElm, input)
      this.#setAttributes(labelElm, {for:input.id, title:input.title})
    })
  
    this.mainDiv.appendChild(this.divcont);
  }

  #SelectElm(){
    var select  = document.createElement('select')

    for(const key in this.Inputs){
      var option  = document.createElement('option')
      option.value = key
      option.innerHTML = key.toUpperCase()
      select.appendChild(option);
    }

    this.#setAttributes(select, {
      value: this.colortype,
      onchange: (e) => this.#changeColorType(e.currentTarget.value),
    })

    this.mainDiv.appendChild(select);
  }

  #changeColorType(value){
    this.colortype = value
    this.divcont.remove()
    this.#NumberInput()
    this.#setInputVal()
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

  #showOutputColor() {
    var opacity = this.colorOp.hsl.a
    var background = (this.colorOp.showFill && Number(opacity) > 0)?
        `hsla(${this.colorOp.hsl.h}, ${this.colorOp.hsl.s}%, ${this.colorOp.hsl.l}%, ${Number(this.colorOp.hsl.a)})` :
          ((this.colorOp.showFill && Number(opacity) == 0) || !this.colorOp.showFill )?
            `linear-gradient(to bottom right, white calc(50% - 1px), red,white calc(50% + 1px) )` :
            'white'
    

    this.outputCanvas.style.background = background 
  }

  #changeRGB(key, value) {
		this.colorOp.rgb[key] = value;
		this.#setRGBtoHSL();
	}

  #changeOpacity(value){
    this.colorOp.hsl.a = value;
    this.colorOp.rgb.a = value;
    this.#setHexValue("convert")
    this.#setColor()
  }

  #setHSL_RGB(){
    this.colorOp.hsl = ColorConvertor.hexToHsl(this.colorOp.hex)
    this.colorOp.rgb = ColorConvertor.hexToRgb(this.colorOp.hex)
  }

  #setHexValue(op, value) {
		if (op == "convert") {
			this.colorOp.hex = ColorConvertor.hslToHex(this.colorOp.hsl);
		} else {
			this.colorOp.hex =
				value + ColorConvertor.decimalToHexOpacity(this.colorOp.hsl.a);
			this.#setHSL_RGB();
			this.#setTopColor();
			hueControl.value = this.colorOp.hsl.h;
		}
	}

  #setRGBtoHSL(){
    this.colorOp.hsl = ColorConvertor.rgbToHsl(this.colorOp.rgb);
		this.#setHexValue("convert");
    this.#setTopColor()
    hueControl.value = this.colorOp.hsl.h
  }

  #setHSLtoRGB(){
    this.colorOp.rgb = ColorConvertor.hslToRgb(this.colorOp.hsl);
    this.#setHexValue("convert")
    this.#setTopColor()
  }

  #changeHue(value, save = true) {
    this.colorOp.hsl.h = (value < 0)? value % 360 : (value > 360)? value % 360 : (value == "")? 0 : value
    
    hueControl.value = this.colorOp.hsl.h;
		this.#setHSLtoRGB();
		this.#setInputVal();
  }

  #changeSat(value){
    var newVal = (value < 0)? value % 100 : (value > 100)? value % 100 : (value == "")? 0: value
    this.colorOp.hsl.s = newVal * 100;
    this.#setHSLtoRGB()
  }

  #changeLight(value){
    var newVal = (value < 0)? value % 100 : (value > 100)? value % 100 : (value == "")? 0: value
    this.colorOp.hsl.l = newVal * 100;
    this.#setHSLtoRGB()
    this.#setColor()
  }

  #setTopColor(){
    this.#generateSLGradient();
    this.#showOutputColor();

    this.opacityControl.style.background = "linear-gradient(to right, transparent, "+this.getFill()+")";
  }

  #setColor(){
    this.#setTopColor()
    this.#setInputVal()
  }

  #setInputVal(){
    if(this.colortype == "hsl"){
      HInput.value = this.colorOp[this.colortype].h;
      SInput.value = this.colorOp[this.colortype].s;
      LInput.value = this.colorOp[this.colortype].l;
    }else if(this.colortype == "rgb"){
      RInput.value = this.colorOp[this.colortype].r;
      GInput.value = this.colorOp[this.colortype].g;
      BInput.value = this.colorOp[this.colortype].b;
    }else{
      HexInput.value = this.colorOp.hex;
    }
  }

  getFill(){
    return (this.colorOp.showFill)?
        `hsl(${this.colorOp.hsl.h}, ${this.colorOp.hsl.s}%, ${this.colorOp.hsl.l}%)`: null
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
    this.colorOp.hsl.s = (x / this.slCanvas.width) * 100;
    const lightnessDecreaseFactor = 1 - (0.5 * x) / this.slCanvas.width;
    this.colorOp.hsl.l =
        (1 -
        0.5 * (x / this.slCanvas.width) ** 1 -
        (y / this.slCanvas.height) * lightnessDecreaseFactor) * 100;

    this.#setHexValue("convert");
		this.colorOp.rgb = ColorConvertor.hexToRgb(this.colorOp.hex);
    this.#setColor()
  }

  #generateSLGradient() {
    const { width, height } = this.slCtx.canvas;

    // To-Do speedup this
    const stepSize = 2;
    for (let x = 0; x < width; x += stepSize) {
      for (let y = 0; y < height; y += stepSize) {
        const saturation = x / width;
        const lightnessDecreaseFactor = 1 - (0.5 * x) / width;
        const lightness =
          1 - 0.5 * (x / width) ** 1 - (y / height) * lightnessDecreaseFactor;
          this.slCtx.fillStyle = `hsl(${this.colorOp.hsl.h}, ${saturation * 100}%, ${lightness * 100}%)`;
        this.slCtx.fillRect(x, y, stepSize, stepSize);
      }
    }

    // Warning, inverting the formula must be done again if we change it
    const dotX = (this.colorOp.hsl.s/100) * width;
    const lightnessDecreaseFactor = 1 - (0.5 * dotX) / width;
    const dotY =
      (-((this.colorOp.hsl.l/100) - 1 + 0.5 * (dotX / width) ** 1) /
        lightnessDecreaseFactor) *
      height;

      this.slCtx.strokeStyle = "white";
      this.slCtx.beginPath();
      this.slCtx.arc(dotX, dotY, 5, 0, 2 * Math.PI);
      this.slCtx.lineWidth = 3;
      this.slCtx.stroke();
      this.slCtx.strokeStyle = "black";
      this.slCtx.lineWidth = 1;
      this.slCtx.stroke();
  }
}

class ColorConvertor {
	static hslToRgb(hsla = { h: 0, s: 50, l: 50, a: 1 }) {
		const h = hsla.h;
		const s = hsla.s / 100;
		const l = hsla.l / 100;
		const a = hsla.a;

		const c = (1 - Math.abs(2 * l - 1)) * s;
		const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
		const m = l - c / 2;

		let r = 0,
			g = 0,
			b = 0;

		if (0 <= h && h < 60) {
			r = c;
			g = x;
			b = 0;
		} else if (60 <= h && h < 120) {
			r = x;
			g = c;
			b = 0;
		} else if (120 <= h && h < 180) {
			r = 0;
			g = c;
			b = x;
		} else if (180 <= h && h < 240) {
			r = 0;
			g = x;
			b = c;
		} else if (240 <= h && h < 300) {
			r = x;
			g = 0;
			b = c;
		} else if (300 <= h && h < 360) {
			r = c;
			g = 0;
			b = x;
		}

		r = Math.round((r + m) * 255);
		g = Math.round((g + m) * 255);
		b = Math.round((b + m) * 255);

		return { r, g, b, a };
	}

	static rgbToHex(rgba = { r: 0, g: 0, b: 0, a: 1 }) {
		const { r, g, b, a } = rgba;
		return (
			"#" +
			[r, g, b, a]
				.map((x, idx) => {
					const hex =
						idx == 3
							? ColorConvertor.decimalToHexOpacity(x)
							: x.toString(16);
					return hex.length === 1 ? "0" + hex : hex;
				})
				.join("")
		);
	}

	static hslToHex(hsla = { h: 0, s: 50, l: 50, alpha: 1 }) {
		const rgba = ColorConvertor.hslToRgb(hsla);
		return ColorConvertor.rgbToHex(rgba);
	}

	static rgbToHsl(rgba = { r: 0, g: 0, b: 0, a: 1 }) {
		const r = rgba.r / 255;
		const g = rgba.g / 255;
		const b = rgba.b / 255;

		const max = Math.max(r, g, b);
		const min = Math.min(r, g, b);
		const delta = max - min;

		let h = 0,
			s = 0,
			l = (max + min) / 2;

		if (delta !== 0) {
			s = l > 0.5 ? delta / (2 - max - min) : delta / (max + min);
			switch (max) {
				case r:
					h = (g - b) / delta + (g < b ? 6 : 0);
					break;
				case g:
					h = (b - r) / delta + 2;
					break;
				case b:
					h = (r - g) / delta + 4;
					break;
			}
			h *= 60;
		}

		return {
			h: Math.round(h),
			s: Math.round(s * 100),
			l: Math.round(l * 100),
			a: rgba.a,
		};
	}

	static hexToRgb(hex) {
		hex = hex.replace("#", "");
		if (hex.length === 3 || hex.length === 4) {
			hex = hex
				.split("")
				.map((c) => c + c)
				.join("");
		}

		const a = hex.length === 8 ? parseInt(hex.slice(6, 8), 16) / 255 : 1;
		const bigint = parseInt(hex, 16);

		return {
			r: (bigint >> 16) & 255,
			g: (bigint >> 8) & 255,
			b: bigint & 255,
			a,
		};
	}

	static hexToHsl(hex) {
		const rgba = ColorConvertor.hexToRgb(hex);
		return ColorConvertor.rgbToHsl(rgba);
	}

	static decimalToHexOpacity(decimal) {
		if (decimal < 0 || decimal > 1) {
			throw new Error("Opacity must be a decimal between 0 and 1.");
		}
		// Convert to 8-bit value and to hex
		let hex = Math.round(decimal * 255).toString(16);
		// Ensure it's two characters long
		return hex.padStart(2, "0");
	}

	static NumberToHex(number) {
		if (number < 0 && number > 255) {
			throw new Error("Value must be a number between 0 and 255.");
		}
		// Convert to 8-bit value and to hex
		let hex = number.toString(16);
		// Ensure it's two characters long
		return hex.padStart(2, "0").toString();
	}
}


new ColorPicker(
  document.getElementById("color_Picker1"),
  "#ff0000"
);