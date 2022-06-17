const path = require('path')
const os = require('os')
const express = require('express')
const app = express()
const expressStaticGzip = require('express-static-gzip')
const history = require('connect-history-api-fallback')

app.use('/', expressStaticGzip('dist'))

app.use(history({
	verbose: true,
	index: '/'
}))

app.get('/', (req, res) => {
	console.log('time: ', new Date())
	res.sendFile(path.join(__dirname, 'dist/index.html'))
})

const getIpAddress = () => {
	const interfaces = os.networkInterfaces()
	for (const dev in interfaces) {
		const iface = interfaces[dev]
		for (let i = 0; i < iface.length; i++) {
			const { family, address, internal } = iface[i]
			if (family === 'IPv4' && address !== '127.0.0.1' && !internal) {
				return address
			}
		}
	}
}

app.listen(8023, () => {
	console.log('服务启动' + 8023)
	console.log('http://' + getIpAddress() + ':' + 8023)
})
