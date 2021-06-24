const mongoose = require('mongoose');
const Doc = require('./doc')


const username = encodeURIComponent('drop')
const password = encodeURIComponent('drop123')
const clusterUrl = 'drop.hwbwf.mongodb.net';
let dbURI = `mongodb+srv://${username}:${password}@${clusterUrl}/document`;

mongoose.connect(dbURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
    useCreateIndex: true,
})


const io = require('socket.io')(3001, {
    cors: {
        origin: 'http://localhost:3000',
        method: ['GET', 'POST']
    }
})

io.on('connection', socket => {
    socket.on('get-document', documentID => {
        const document = findOrCreateDoc(documentID)
        socket.join(documentID)
        socket.emit('load-document', document.data)
        socket.on('send-changes', delta => {
            socket.broadcast.to(documentID).emit('receive-changes', delta)
        })
        socket.on('save-document', async data => {
            await Doc.findByIdAndUpdate(documentId, { data })
        })
    })
})


const defaultValue = ''
async function findOrCreateDoc(id) {
    if (id == null) return

    const document = await Doc.findById(id)
    if (document) return document
    return await Doc.create({ _id: id, data: defaultValue })
}