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
require("./models/Categoria")
const Categoria = mongoose.model("categorias")

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

    app.get("/postagem/:slug", (req, res) => {
        Postagem.findOne({slug: req.params.slug}).lean().then((postagem) => {
            if(postagem) {
                res.render("postagem/index", {postagem: postagem})
            } else {
                req.flash("error_msg", "Esta postagem não existe")
                req.redirect("/")
            }
        }).catch((err) => {
            req.flash("error_msg", "Houve um erro interno.")
            res.redirect("/")
        })
    })

    app.get("/categorias", (req, res) => {
        Categoria.find().lean().then((categorias) => {
            res.render("categorias/index", {categorias: categorias})
        }).catch((err) => {
            req.flash("error_msg", "Houve um erro interno ao listar as categorias")
            res.redirect("/")
        })
    })

    app.get("/categorias/:slug", (req, res) => {
        Categoria.findOne({slug: req.params.slug}).lean().then((categoria) => {
            if(categoria){
                Postagem.find({categoria: categoria._id}).lean().then((postagens) => {
                    res.render("categorias/postagens", {postagens: postagens, categoria: categoria})
                }).catch((err) => {
                    req.flash("error_msg", "Houve um erro ao listar os posts!")
                    res.redirect("/")
                })
            }else{
                req.flash("error_msg", "Esta categoria não existe")
                res.redirect("/")
            }
        }).catch((err) => {
            req.flash("error_msg", "Houve um erro interno ao carregar a página desta categoria")
            res.redirect("/")
        })
    })

    app.get("/404", (req, res) => {
        res.send("Erro 404!")
    })


    app.use("/admin", admin)

// outros
const PORT = 8089
app.listen(PORT, () => {
    console.log("Servidor rodando! ")
})

// body parser
// app.use(bodyParser.urlencoded({extended:true}))

