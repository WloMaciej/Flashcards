const express = require("express");
const app = express();
const fs = require("fs");
const session = require("express-session")


// Loading "DB"

let flashcards = JSON.parse(fs.readFileSync("flashcards.json"))
let users = JSON.parse(fs.readFileSync("users.json"))
let personilized = JSON.parse(fs.readFileSync("personilized.json"))



// Function definitions

const alreadyExists = function(users, username){
    return users.filter(function(el){
        return el.username === username
    }).length
}

const validateUser = function(users, username, password){
    const validated = users.filter(function(el){
        return el.username === username && el.password === password
    })
    if(validated.length){
        return validated[0].id
    } else{
        return false
    }
}


const addUser = function(username, password){
    if (alreadyExists(users, username)){
        return 0
    } else{
        const id = users.length + 1
        
        users.push({
            username: username,
            password: password,
            id: id
        })
        
        personilized[id] = {
            hard: [...Array(2800).keys()],
            medium: [],
            easy: []
        }
        
        fs.writeFile("users.json", JSON.stringify(users), function(err){
            if(err){
                throw err
            } else{
                console.log("Users updated")
            }
        })
        
        fs.writeFile("personilized.json", JSON.stringify(personilized), function(err){
            if(err){
                throw err
            } else{
                console.log("Personilized Flashcards updated")
            }
        })
        console.log("user created succesfully")
        return id
    }
}


const updateDB = async function(fc){
    fs.writeFile("flashcards.json", JSON.stringify(fc), function(err){
        if(err){
            throw err
        }else{
            console.log("DB updated")
        }
    })
}


const getRandomizedFlashCard = function(difficulty, personilized, userID){
    let group
    let len
    switch(difficulty){
        case 9:
            group = personilized[userID].easy
            len = group.length
            if(len){
                break
            }
        case 8:
        case 7:
        case 6:
            group = personilized[userID].medium
            len = group.length
            if(len){
                break
            }
        default:
            group = personilized[userID].hard
            len = group.length
    }
    const choice = Math.floor(Math.random() * len)
    return group[choice]
}

const updateDifficulty = function(id, difficulty, userID){
    const groups = [personilized[userID].easy, personilized[userID].medium, personilized[userID].hard]
    groups.forEach(function(el, index){
        if(index === difficulty){
            if(el.includes(id)){
                return
            } else{
                el.push(id)
            }
        } else{
            let found = el.indexOf(id)
            if (found > -1){
                el.splice(found, 1)
            }
        }
    })
    fs.writeFile("personilized.json", JSON.stringify(personilized), function(err){
            if(err){
                throw err
            } else{
                console.log("Personilized Flashcards updated")
            }
        })
}


// MIDDLEWARE

app.use(session({
    secret: "pzdr",
    saveUninitialized: false,
    resave: false,
    cookie: {
        maxAge: 60000 * 60,
    },
}))

app.use(express.static("public"))

app.use(
    express.urlencoded({
        extended: true,
        inflate: true,
        limit: "1mb",
        parameterLimit: 5000,
        type: "application/x-www-form-urlencoded",
    })
);




//Individual Routes

app.get("/login", (req, res) => {
    if(req.session.userID){
        res.redirect("/")
    }else{
        res.redirect("/login.html")
    }
})

app.get("/logout", (req, res) => {
    console.log(req.session.userID + " succesfully logged out")
    req.session.destroy()
    res.redirect("/login")
})

////TODO
app.post("/login", (req, res) => {
    const id = validateUser(users, req.body.username, req.body.password)
    if(id){
        req.session.userID = id
        console.log(req.body.username + " succesfully logged in")
        console.log(req.session.id)
        console.log(req.session.userID)
        res.redirect("/")
    } else{
        res.status(401).redirect("/login")
    }
})

app.post("/signup", (req, res) => {
    const id = addUser(req.body.username, req.body.password)
    if(id){
        console.log("new user created")
        res.status(100).redirect("/login")
    } else{
        res.status(401).redirect("/login")
    }
})



app.use((req, res, next) => {
    if(req.session.userID){
        next()
    } else{
        res.redirect("/login")
    }
})


app.get("/getFlashCard", (req, res) => {
    const difficulty = Math.floor(Math.random() * 10)
    const id = getRandomizedFlashCard(difficulty, personilized, req.session.userID)
    const fc = flashcards[id]
    res.send(JSON.stringify({
        id: id,
        fc: fc
    })
    )
})


app.post("/edittranslation", (req, res) => {
    const translation = req.body.translation
    const pass = req.body.pass
    const id = parseInt(req.body.wordid)
    if (pass === "aqq"){
        flashcards[id].translation = translation
        updateDB(flashcards)
    }
    if(req.body.difficulty){
        const difficulty = parseInt(req.body.difficulty)
        updateDifficulty(id, difficulty, req.session.userID)
    }
    res.redirect("/")
})




app.listen(3000,"192.168.2.224" ,() => console.log("listening at port 3000..."))

