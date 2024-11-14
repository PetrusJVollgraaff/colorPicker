class ColorPicker {
  constructor(options, colorOp, elem) {
    this.settings = {
      ...{
        title: "Color Picker",
        buttons: undefined,
        customClass: undefined,
        outsideClose: true,
        onClose: undefined,
        onOpen: undefined,
        width: 150,
        height: 100,
      },
      ...options,
    };

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
    this.popupEl = null;
    this.elem = elem;

    this.slCanvas = document.createElement("canvas");
    this.slCtx = this.slCanvas.getContext("2d");
    this.slCanvas.width = this.settings.width;
    this.slCanvas.height = this.settings.height;
        
    this.outputCanvas = document.createElement("canvas");
    this.outputCanvas.width = 30;
    this.outputCanvas.height = 30;

    this.opacityControl = document.createElement('input')

    this.#setColor()

    this.#init();
  }

  #setColor(){
    this.#generateSLGradient(this.colorOp.hue, this.slCtx);
    this.#showOutputColor(
        this.colorOp.hue,
      this.colorOp.saturation,
      this.colorOp.lightness,
      this.colorOp.showFill,
      this.outputCanvas
    );

    console.log(this.getFill())

    this.opacityControl.style.background = "linear-gradient(to right, transparent, "+this.getFill()+")";
  }

  getFill(){
    if(this.colorOp.showFill){
       return `hsl(${this.colorOp.hue}, ${this.colorOp.saturation * 100}%, ${this.colorOp.lightness * 100}%)`;
    }else{
       return null;
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

  #init() {
    this.elem.addEventListener("click", this.open.bind(this));
  }

  #loadContent() {
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
        //onchange: (e) => this.#changeHue(e.currentTarget.value),
        //oninput: (e) => this.#changeHue(e.currentTarget.value, false),
        title: "Opacity",
        type: "range",
        value: this.colorOp.opacity,
    })

    var contentCtn = this.popupEl.getElementsByClassName("content_ctn");
    contentCtn[0].appendChild(this.slCanvas);
    contentCtn[0].appendChild(this.outputCanvas);
    contentCtn[0].appendChild(hueControl);
    contentCtn[0].appendChild(this.opacityControl)

    this.#loadButtons();
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

  #showOutputColor(hue, saturation, lightness, showFill, canvas) {
    const ctx = canvas.getContext("2d");
    if (showFill) {
      ctx.fillStyle = `hsl(${hue}, ${saturation * 100}%, ${lightness * 100}%)`;
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

  #changeHue(value, save = true) {
    this.colorOp.hue = value;
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

  open() {
    var modal = this.#buildModal();
    var body = document.getElementsByTagName("body");
    body[0].insertAdjacentHTML("beforeend", modal);

    this.popupEl = body[0].lastChild;

    this.#loadContent(() => {
      if (typeof this.settings.onOpen == "function") {
        this.settings.onOpen(this);
      }
    });

    this.#addColorEvent()
  }

  close() {
    if (this.settings.onClose != undefined && typeof this.settings.onClose == "function") {
        this.settings.onClose();
    }
	    
    this.popupEl.remove();
  }
}

new ColorPicker(
  {
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
  },
  {},
  document.getElementById("color_Picker")
);
