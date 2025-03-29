
async function getNewFlashcard(){
    const response = await fetch("/getFlashCard")
    const json = await response.json()
    document.getElementById("flashcard-front").textContent = json.fc.original
    document.getElementById("flashcard-back").textContent = json.fc.translation
    document.getElementById("wordid").value = json.id
}


function flip(){
    document.getElementById("flashcard-front").classList.toggle("current")
    setTimeout(function(){
        document.getElementById("flashcard-back").classList.toggle("border-hidden")
        document.getElementById("flashcard-back").classList.toggle("current")
        document.getElementById("flashcard-front").classList.toggle("border-hidden")
    }, 200)
}

function flipReverse(){
    document.getElementById("flashcard-back").classList.toggle("current")
    setTimeout(function(){
        document.getElementById("flashcard-front").classList.toggle("border-hidden")
        document.getElementById("flashcard-front").classList.toggle("current")
        document.getElementById("flashcard-back").classList.toggle("border-hidden")
    }, 200)
}

if(document.title == "Flashcards"){
    getNewFlashcard()
}