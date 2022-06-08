const fs = require('fs')
const { Builder, By } = require('selenium-webdriver')
const chrome = require('selenium-webdriver/chrome')
const path = require('chromedriver').path // 必要，不能删除
const Path = require('path')
const jsDom = require('jsdom').JSDOM
const jquery = require('jquery')

const createJson = (data, fileName = 'collection-tree') => {
	fs.writeFileSync(Path.join(__dirname, './data/' + fileName + '.json'), JSON.stringify(data, null, '\t'))
}

// 获取分页
const getPage = async (driver, page = 1) => {
	await driver.get('https://sh.ziroom.com/z/z1-r0-p' + page + '/?p=b4-d31|32-l1&c=c%E4%B8%AD%E6%B8%AF%E6%B1%87-t0-m60-g1133988824976&cp=3000TO4500&isOpen=1')
	// await driver.sleep(1000 * 10)
	const json = []
	let $ = jquery(new jsDom(await driver.getPageSource()).window)
	$('.Z_list>.Z_list-box .item').each(function () {
		const room = {}
		const text1 = $(this).find('.desc').children('div').eq(0).text()
		const text2 = $(this).find('.location').text()
		const text3 = $(this).find('.tip-info').text()
		room.id = ''
		room.name = $(this).find('.title').text()
		room.indexHtml = 'https:' + $(this).find('.pic-wrap').attr('href') // 主页
		room.cover = 'https:' + $(this).find('.lazy').attr('src') // 封面
		room.area = Number(text1.substring(0, text1.lastIndexOf('㎡'))) // 面积
		room.layers = Number(text1.substring(text1.lastIndexOf('|') + 2, text1.lastIndexOf('/'))) // 层数
		room.buildingHeight = Number(text1.substring(text1.lastIndexOf('/') + 1, text1.length - 1)) // 楼高
		room.fromSubway = Number(text2.substring(text2.lastIndexOf('约') + 1, text2.lastIndexOf('米'))) // 离地铁距离
		room.subwayStation = text2.substring(text2.indexOf('距') + 1, text2.indexOf('站') + 1) // 地铁站
		room.openDay = text3.substring(text3.indexOf('预计') + 2, text3.indexOf('可入住')) // 开放日

		json.push(room)
	})

	const isNextPage = Boolean($('.next').text())

	for (let i = 0; i < json.length; i++) {
		const room = json[i]

		await driver.get('https:' + room.indexHtml)

		$ = jquery(new jsDom(await driver.getPageSource()).window)

		room.houseTypeImg = 'https:' + $('.tempWrap').find('ul li').eq($('.tempWrap').find('ul li').length - 2).find('img').attr('src') // 户型图

		// room.screenshot = 'data:image/webp;base64,' + await driver.takeScreenshot() // 详情页截图
	}

	return {
		data: json,
		isNextPage: isNextPage // 是否存在下一页
	}
}

async function example () {
	// const driver = new Builder().forBrowser('chrome').setChromeOptions(new chrome.Options().detachDriver(true)).build()
	const driver = new Builder().forBrowser('chrome').setChromeOptions(new chrome.Options()).build()
	// const driver = new Builder().forBrowser('chrome').setChromeOptions(new chrome.Options().headless()).build()
	try {
		// await driver.findElement(By.css('#settings_person')).click()
		// await driver.sleep(2000)
		// await driver.findElement(By.css('input[name="login_name"]')).sendKeys('18725944157@163.com')
		// await driver.findElement(By.css('input[name="login_pass"]')).sendKeys('jiang1995991')
		// await driver.findElement(By.css('input[type="submit"]')).click()
		// await driver.sleep(2000)
		// await driver.get('https://www.wnacg.org/users-users_fav.html')
		// let $ = jquery(new jsDom(await driver.getPageSource()).window)
		// $('.nav_list a').each(function () {
		// 	console.log('ddd', $(this).text())
		// })
		// console.log('aa', $('.nav_list a').html())
		// createJson([{}])

		const json = []

		for (let i = 0; i < 100; i++) {
			const page = i + 1
			console.log('page', page)
			const pageInfo = await getPage(driver, page)
			json.push(...pageInfo.data)
			if (!pageInfo.isNextPage) i = 100
		}

		// console.log('json', json)
		createJson(json)
		// for (let i = 0; i < 3; i++) {
		// 	let $ = jquery(new jsDom(await driver.getPageSource()).window)
		// 	$('.nav_list a').each(function () {
		// 		console.log('ddd', $(this).text())
		// 	})
		// }
		// await driver.sleep(1000000)
	} finally {
		// driver.quit()
	}
}

example()
