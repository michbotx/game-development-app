class App {
    constructor() {
        this.notes = JSON.parse(localStorage.getItem("notes"))  || []// get our notes from the storage and turn it from string to array using JSON parse. if notes, stringiy, if not, create empty array
        this.title = "";
        this.text = "";
        this.id = "";
        this.$notes = document.querySelector("#notes")
        this.$noteTitle = document.querySelector("#note-title")
        this.$noteText = document.querySelector("#note-text")
        this.$placeholder = document.querySelector("#placeholder")
        this.$form = document.querySelector("#form")
        this.$formButtons = document.querySelector("#form-buttons")
        this.$form = document.querySelector("#form")
        this.$formButtons = document.querySelector("#form-buttons")

        this.$closeBtn = document.querySelector("#form-close-button")
        this.$modal = document.querySelector(".modal")
        this.$modalCloseBtn = document.querySelector(".modal-close-button")
        this.$modalTitle = document.querySelector(".modal-title")
        this.$modalText = document.querySelector(".modal-text")
        this.$colorTooltip = document.querySelector("#color-tooltip")
        
        this.render() // to display initial notes available on notes property
        this.addEventListeners() 
    }

    addEventListeners() {
        document.body.addEventListener("click", e => {
            this.handleFormClick(e)
            this.selectNote(e) //.select note first to allow new note to be set first before modal is opened
            this.openModal(e)
            this.deleteNote(e);
        })
        document.body.addEventListener("mouseover", e => {
        this.openTooltip(e)
        })
        document.body.addEventListener("mouseout", e => {
        this.closeTooltip(e)
        })
        this.$colorTooltip.addEventListener("mouseover", function() {
            this.style.display = "flex"
        })
        this.$colorTooltip.addEventListener("mouseout", function() {
            this.style.display = "none"
        })

        this.$colorTooltip.addEventListener("click", e => {
            const color = e.target.dataset.color
            if (color) {
                this.editNoteColor(color)
            }
        })

        this.$form.addEventListener("submit", e => {
            e.preventDefault();
            const title = this.$noteTitle.value;
            const text = this.$noteText.value
            const hasNote = title || text 
            if (hasNote) {
                // add note
                this.addNote({ title, text });
              }         
        })
        this.$closeBtn.addEventListener("click", e => {
            e.stopPropagation() //stops event from bubbling up to the parent function 
            this.closeForm() 
        })
        this.$modalCloseBtn.addEventListener("click", e => {
            e.stopPropagation()
            this.closeModal()
        })
    }

    handleFormClick(e) {
       const isFormClicked = this.$form.contains(e.target)
       const title = this.$noteTitle.value;
       const text = this.$noteText.value
       const hasNote = title || text 

        if (isFormClicked) {
            this.openForm()
        } else if (hasNote) {
            this.addNote({title, text})   
        } else {
            this.closeForm()
        }
    }
    openForm() {
        this.$form.classList.add("form-open")
        this.$noteTitle.style.display = "block";
        this.$formButtons.style.display = "block"
    }
    closeForm() {
        this.$form.classList.remove("form-open")
        this.$noteTitle.style.display = "none";
        this.$formButtons.style.display = "none"
        this.$noteTitle.value = "";
        this.$noteText.value = "";
    }

    openModal(e) {
        if (e.target.matches(".toolbar-delete")) return // dont show the modal is the target matches the toolbar delete icon
        if (e.target.closest(".note")) { // element was closest to our notes
            this.$modal.classList.toggle("open-modal")
            this.$modalTitle.value = this.title;
            this.$modalText.value = this.text;
        } 
    }

    closeModal(e) {
        this.editNote();
        this.$modal.classList.toggle("open-modal");
    }

    openTooltip(e) {
        if (!e.target.matches(".toolbar-color")) return;
        this.id = e.target.dataset.id //gives us the note div and accesses that div's id
        const noteCoords = e.target.getBoundingClientRect() //gives specific info about cooridnates where user is hover
        const horizontal = noteCoords.left;
        const vertical = window.scrollY - 20; //allows us to position the tooltip dependingo n window position
        this.$colorTooltip.style.transform = `translate(${horizontal}px, ${vertical}px)`
        this.$colorTooltip.style.display = "flex"
    }
    closeTooltip(e) {
        if (!e.target.matches(".toolbar-color")) return;
        this.$colorTooltip.style.display = "none"
    }


    addNote(note) {
        const newNote = {
            title: note.title,
            text: note.text,
            color: "white",
            id: this.notes.length > 0 
            ? this.notes[this.notes.length-1].id + 1 //increment notes from last note id
            : 1 // otherwise give the noite a 1 if theres no notes
        }
        this.notes = [...this.notes, newNote] //create new array and add in new note and directly mutate the notes list we have
        this.render()
        this.closeForm(); 
    }
    editNote() {
        const title = this.$modalTitle.value
        const text = this.$modalText.value 
        this.notes = this.notes.map(note => 
            note.id === Number(this.id)  ? { ...note, title, text } : note 
        )
        this.render();

    }
    editNoteColor(color) {
        this.notes = this.notes.map(note => 
            note.id === Number(this.id)  ? { ...note, color } : note 
        )
        this.render()
    }
    selectNote(e) {
        const $selectedNote = e.target.closest(".note")
        if (!$selectedNote) return; 
        const [$noteTitle, $noteText] = $selectedNote.children
        this.title = $noteTitle.innerText;
        this.text = $noteText.innerText;
        this.id = $selectedNote.dataset.id;
    }

    deleteNote(e) {
        e.stopPropagation();
        if (!e.target.matches('.toolbar-delete')) return;
        const id = e.target.dataset.id;
        this.notes = this.notes.filter(note => note.id !== Number(id));
        this.render();
      }

      render() {// responsible for calling both of these functions every time
        this.saveNotes(); 
        this.displayNotes() 
      }

    saveNotes() { // store in local storage
        localStorage.setItem("notes", JSON.stringify(this.notes)) // store as json string
    }

    displayNotes() {
        const hasNotes = this.notes.length > 0 
        this.$placeholder.style.display = hasNotes 
        ? "none" 
        : "flex"
        this.$notes.innerHTML = this.notes.map( note => 
                `
                <div style="background: ${note.color};" class="note" data-id="${note.id}">
                <div class="${note.title && 'note-title'}">${note.title}</div>
                <div class="note-text">${note.text}</div>
                <div class="toolbar-container">
                    <div class="toolbar">
                        <img class="toolbar-color" data-id=${note.id} src="images/palette-solid.svg">
                        <img class="toolbar-delete" data-id=${note.id} src="images/trash-solid.svg">
                    </div> 
                </div>
                </div>
                `        
            ).join("") //gets rid of the comma
    }
}

new App()    

