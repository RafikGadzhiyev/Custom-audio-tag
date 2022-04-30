class CustomAudio extends HTMLElement {
    constructor() {
        super();
        this.audio = this.children[0];
        this.audioIndex = 0;
        this.currentSongURL = this.audio.src;
        this.audios = Array.from(this.children).filter(e => e[Symbol.toStringTag] === 'HTMLAudioElement');
        this.total = 0;
        this.current = 0;
        this.attachShadow({
            mode: 'open'
        });
        this.shadowRoot.innerHTML = `
        <style>
        @import url("https://cdn.jsdelivr.net/npm/bootstrap-icons@1.8.0/font/bootstrap-icons.css");
        button{
            all: unset;
            cursor: pointer;
            font-size: inherit;
            color: inherit;
        }
        div[container]{
            display: flex;
            flex-direction: column;
            gap: 10px;
            align-items: center;
            justify-content: center;
            padding: 20px;
            font-size: 30px;
        }
        div[controls]{
            display: flex;
            gap: 10px;
        }
        button[control-button]{
            border-radius: 50%;
            padding: 10px;
            transition: 200ms ease-in;
        }

        button[control-button]:not(:disabled):hover{
            opacity: .8;
        }

        button[next]:disabled,
        button[previous]:disabled{
            cursor: not-allowed;
            opacity: .3;
        }

        div[time-slider]{
            width: 100%;
            height: 10px;
            border-radius: 5px;
            display: flex;
            align-items: center;
        }

        div[time-slider-thumb]{
            width: 20px;
            height:20px;
            border-radius: 50%;
            background-color: inherit;
            position:absolute;
            left: 0;
        }

        div[time-slider-progress]{
            width:0%;
            height: inherit;
            border-radius: 5px 0 0 5px;
            display: flex;
            align-items: center;
            justify-content: flex-end;
        }


        div[time-slider-container]{
            width: 500px;
            display: flex;
            position: relative;
            margin-block: 30px;
        }
        span[current],
        span[total]{
            top: -25px;
            position: absolute;
            font-size: 20px;
            opacity: .5;
        }
        span[total]{
            right: 0;
        }

        div[volume-container]{
            display: flex;
            align-items: center;
            gap: 10px;
        }

        div[volume-slider]{
            width: 200px;
            height: 10px;
            border-radius: 5px;
        }

        div[volume-slider-progress]{
            width: 20%;
            height: inherit;
            border-radius: 5px 0 0 5px;
            position: relative;
        }
        div[volume-slider-thumb]{
            width: 20px;
            height: 20px;
            border-radius: 50px;
            background-color: inherit;
            position: absolute;
            top: -5px;
            left: 90%;
        }

        </style>
            <div container>
            <audio src=${this.currentSongURL} active-audio></audio>
                <div>${this.audio.getAttribute('name')}</div>
                <div time-slider-container>
                    <span current>00:00</span>
                    <div time-slider>
                        <div time-slider-progress>
                            <div time-slider-thumb></div>
                        </div>
                    </div>
                    <span total>02:00</span>
                </div>
                <div>
                    <div controls>
                        <button previous control-button
                            ${this.audios.length === 1 ? 'disabled' : ''}
                        >
                            <i class = 'bi bi-chevron-left' ></i>
                        </button>
                        <button start = true control-button>
                            <i class ="bi bi-caret-right-fill"></i>
                        </button>
                        <button next control-button
                            ${this.audios.length === 1 ? 'disabled' : ''}
                        >
                            <i class ="bi bi-chevron-right"></i>
                        </button>
                    </div>
                </div>
                <div volume-container>
                    <i class = 'bi bi-volume-up-fill'></i>
                    <div volume-slider>
                        <div volume-slider-progress>
                            <div volume-slider-thumb></div>
                        </div>
                    </div>
                </div>
            </div>
        `
        this.audio = this.shadowRoot.querySelector('audio[active-audio]');
    }

    connectedCallback() {
        if (!this.getAttribute('primary-color')) {
            this.setAttribute('primary-color', '#000');
        }
        if (!this.getAttribute('secondary-color')) {
            this.setAttribute('secondary-color', '#fff')
        }
        if (!this.getAttribute('content-color')) {
            this.setAttribute('content-color', '#00a322')
        }
        if (!this.getAttribute('thumb-color')) {
            this.setAttribute('content-color', '#00a322')
        }
        this.audio.loop = false;
        let nextTrackButton = this.shadowRoot.querySelector('button[next]'),
            prevTrackButton = this.shadowRoot.querySelector('button[previous]');
        let stateButton = this.shadowRoot.querySelectorAll('button[control-button]')[1];
        nextTrackButton.onclick = () => this.nextTrack();
        prevTrackButton.onclick = () => this.prevTrack();
        stateButton.onclick = () => {
            if (this.audio.ended || !this.audio.paused) {
                stateButton.removeAttribute('pause');
                stateButton.setAttribute('start', true);
                this.audio.pause();
            } else {
                stateButton.removeAttribute('start');
                stateButton.setAttribute('pause', true);
                this.audio.play();
            }
            stateButton.children[0].classList.toggle('bi-caret-right-fill');
            stateButton.children[0].classList.toggle('bi-pause-fill');
        }
        this.audio.onloadedmetadata = () => {
            let currentTime = this.shadowRoot.querySelector('span[current]'),
                totalTime = this.shadowRoot.querySelector('span[total]'),
                currentAudioTime = this.audio.currentTime,
                totalAudioTime = this.audio.duration;
            this.total = totalAudioTime;
            this.current = currentAudioTime;
            this.setAudioData({
                currentSpan: currentTime,
                totalSpan: totalTime
            })
        }
        this.audio.ontimeupdate = () => {
            this.current = this.audio.currentTime;
            this.setAudioData({
                currentSpan: this.shadowRoot.querySelector('span[current]'),
                totalSpan: this.shadowRoot.querySelector('span[total]')
            })

            this.setTimeSliderProgressWidth(this.current);
        }

        this.audio.onended = () => {
            // stateButton.click();
            this.nextTrack();
        }

        this.audio.volume = Math.abs(1 * parseInt(getComputedStyle(this.shadowRoot.querySelector('div[volume-slider-progress]')).width) / 100);
        this.shadowRoot.querySelector('div[time-slider]').onmousedown = (e) => this.timeSliderDragEvent(e);
        this.shadowRoot.querySelector('div[volume-slider]').onmousedown = (e) => this.volumeSliderDragEvent(e);
    }

    disconnectedCallback() {
        console.log("Why? =(")
    }

    static get observedAttributes() {
        return ['primary-color', 'secondary-color', 'content-color', 'thumb-color'];
    }

    attributeChangedCallback(name, _, newValue) {
        switch (name) {
            case "primary-color":
                this.setBackgroundColor(newValue);
                break;
            case 'secondary-color':
                this.setBackgroundColorToComponent(newValue);
                break;
            case "content-color":
                this.setColor(newValue);
                break;
            case 'thumb-color':
                this.setThumbColor(newValue);
                break;
            default:
                console.log("Does not support this attribute");
        }
    }

    nextTrack() {
        this.audioIndex++;
        if (this.audioIndex > this.audios.length - 1) {
            this.audioIndex = 0;
        }
        this.setTrack();
    }

    prevTrack() {
        this.audioIndex--;
        if (this.audioIndex < 0) {
            this.audioIndex = this.audios.length - 1;
        }
        this.setTrack();
    }

    setTrack() {
        this.audio.src = this.audios[this.audioIndex].src;
        this.audio.currentTime = 0;
        this.audio.play();
    }

    volumeSliderDragEvent(e) {
        e.preventDefault();
        let slider = this.shadowRoot.querySelector('div[volume-slider]'),
            coords = slider.getBoundingClientRect(),
            x = e.clientX - coords.left,
            sliderProgress = this.shadowRoot.querySelector('div[volume-slider-progress]'),
            sliderWidth = coords.width,
            audio = this.audio;

        moveAt(x);

        function moveAt(x) {
            let width = x * 100 / sliderWidth;
            if (width < -3) {
                width = 0;
            }
            if (width > 100) {
                return;
            };
            audio.volume = Math.abs(1 * width / 100);
            sliderProgress.style.width = `${x * 100 / sliderWidth}%`
        }

        function onMouseMove(e) {
            moveAt(e.clientX - coords.left)
        }

        function onMouseUp() {
            document.onmousemove = () => {};
        }

        document.onmousemove = (e) => onMouseMove(e);
        slider.onmouseup = () => onMouseUp();
    }

    timeSliderDragEvent(e) {
        e.preventDefault();
        if (!this.audio.paused) {
            this.shadowRoot.querySelectorAll('button[control-button]')[1].click();
        }
        let coords = e.target.closest('div[time-slider]').getBoundingClientRect(),
            thumb = this.shadowRoot.querySelector('div[time-slider-thumb]'),
            x = e.clientX - coords.left,
            sliderProgress = this.shadowRoot.querySelector('div[time-slider-progress]'),
            slider = e.target.closest('div[time-slider]'),
            sliderWidth = parseInt(getComputedStyle(slider).width);


        moveAt(x);

        function moveAt(x) {
            let width = x * 100 / sliderWidth;
            if (width < -2) width = 0;
            if (width > 98) width = 98;
            sliderProgress.style.width = `${width}%`
            thumb.style.left = `${width}%`
        }

        function onMouseMove(e) {
            moveAt(e.clientX - coords.left);
        }

        document.onmousemove = (e) => onMouseMove(e);
        slider.onmouseup = (e) => {
            let width = (e.clientX - coords.left) * 100 / sliderWidth;
            this.audio.currentTime = this.audio.duration * width / 100;
            if (this.audio.paused) {
                this.shadowRoot.querySelectorAll('button[control-button]')[1].click();
            }
            document.onmousemove = () => {};
        }
    }

    setTimeSliderProgressWidth(time) {
        this.shadowRoot.querySelector('div[time-slider-progress]').style.width = `${time * 100 / this.total}%`
        this.shadowRoot.querySelector('div[time-slider-thumb]').style.left = `${time * 100 / this.total}%`
    }

    setAudioData({
        currentSpan,
        totalSpan
    }) {

        let currentTime = this.audio.currentTime,
            totalTime = this.audio.duration;
        currentSpan.textContent = `${(Math.floor(currentTime / 60) < 10 ? '0' : '') + Math.floor(currentTime / 60)}:${(Math.floor(currentTime % 60) < 10 ? '0' : '') + Math.floor(currentTime % 60)}`
        totalSpan.textContent = `${(Math.floor(totalTime / 60) < 10 ? '0' : '') + Math.floor(totalTime / 60)}:${(Math.floor(totalTime % 60) < 10 ? '0' : '') + Math.floor(totalTime % 60)}`
    }

    setThumbColor(color) {
        this.shadowRoot.querySelector('div[time-slider-progress]').style.backgroundColor = color;
        this.shadowRoot.querySelector('div[volume-slider-progress]').style.backgroundColor = color;
    }

    setColor(color) {
        this.shadowRoot.querySelector('[container]').style.color = color;
    }

    setBackgroundColorToComponent(color) {
        this.shadowRoot.querySelector('[controls]').querySelectorAll('button').forEach(button => {
            button.style.backgroundColor = color;
            button.style.color = this.getAttribute('primary-color') || '#000'
        })
        this.shadowRoot.querySelector('div[time-slider]').style.backgroundColor = color;
        this.shadowRoot.querySelector('div[volume-slider]').style.backgroundColor = color;
    }

    setBackgroundColor(color) {
        this.shadowRoot.querySelector('[container]').style.backgroundColor = color;
    }

    adoptedCallback() {

    }
}

window.customElements.define('custom-audio', CustomAudio);