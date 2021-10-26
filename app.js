// carregando modulos
const express = require("express")
const handlebars = require("express-handlebars")
const bodyParser = require("body-parser")
const app = express()
const admin = require("./routes/admin")
const path = require("path")
const mongoose = require("mongoose")
const session = require("express-session")
const flash = require("connect-flash")
const { application } = require("express")  // ??
const exp = require("constants")
require("./models/Postagem")
const Postagem = mongoose.model("postagens")

// configuracoes
    // sessao
    app.use(session({
        secret: "cursoNode",
        resave: true,
        saveUninitialized: true
    }))
    app.use(flash())        // config. flash

    // middleware [locals = variaveis globais]
    app.use((req, res, next) => {
        res.locals.success_msg = req.flash("success_msg"),
        res.locals.error_msg = req.flash("error_msg")
        next()
    })

    // bodyParser
    app.use(bodyParser.urlencoded({extended: true}))
    app.use(bodyParser.json())

    // handlebars
    app.engine('handlebars', handlebars({defaultLayout: 'main'})) 
    app.set('view engine', 'handlebars')

    // mongoose (conexao ao mongo db)
    mongoose.Promise = global.Promise   // para evitar erros
    mongoose.connect("mongodb://localhost/blogapp").then( () => {
        console.log("Conectado ao mongo.")
    }).catch((err) => {
        console.log("Erro ao se conectar ao mongo. " + err)
    })

    // public
    app.use(express.static(path.join(__dirname, "public")))
    
    // criando o middleware
    app.use((req, res, next) => {
        next()
    })

// rotas
    app.get('/', (req, res) => {
        Postagem.find().populate('categoria').sort({data: 'desc'}).then((postagens) => {
            res.render('index', {postagens: postagens.map((postagem) => postagem.toJSON())});
        }).catch((err) => {
            req.flash('error_msg', 'Houve um erro ao listar postagens');
            res.redirect('/404');
        });
    });


    app.get("/404", (req, res) => {
        res.send("Erro 404!")
    })

    app.get('/posts', (req, res) => {
        res.send('Lista posts')
    })

    app.use("/admin", admin)

// outros
const PORT = 8089
app.listen(PORT, () => {
    console.log("Servidor rodando! ")
})

// body parser
// app.use(bodyParser.urlencoded({extended:true}))

