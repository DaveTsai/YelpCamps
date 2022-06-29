const express = require(`express`)
const app = express()
const { append } = require("express/lib/response")
const morgan = require(`morgan`)

app.use(morgan(`tiny`))
app.use((req, res, next) => {
    console.log(req.method.toUpperCase(), req.path);
    next();


})

app.use((req, res, next) => {
    res.sendStatus(404).send(`Not found`)
})

app.get(`/dogs`, (req, res) => {

    res.send(`Woof`)
})

app.listen(3000, () => {
    console.log(`Connect port 3000`)
})