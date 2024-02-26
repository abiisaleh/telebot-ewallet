require('dotenv').config()

const { Telegraf } = require('telegraf') 
const { message } = require('telegraf/filters')

const bot = new Telegraf(process.env.BOT_TOKEN)

const api = 'https://api-rekening.lfourr.com'

async function getEwallet(){
  const response = await fetch(`${api}/listEwallet`)
  const data = await response.json()
  return data
}

async function getAccountName(bank, telp){
  const response = await fetch(`${api}/getEwalletAccount?bankCode=${bank}&accountNumber=${telp}`)
  const data = await response.json()
  return data
}

bot.start((ctx) => ctx.reply('Welcome'))
bot.help((ctx) => ctx.reply('kirim nomor telp yang mau di cek akun ewallet-nya'))

bot.on(message('text'), async (ctx) => {

  const telp = ctx.message.text
  const idCode = /^(\+62|62|0)(\d{8,15})$/

  // validasi nomor telp
  if (!idCode.test(telp)) {
    return await ctx.reply(`nomor yang anda masukkan salah`)
  }

  // Using context shortcut
  let msg = '';
  const ewallet = await getEwallet()

  for (const bank of ewallet.data) {
    const pemilik = await getAccountName(bank.kodeBank, telp)

    try {
      msg += `${bank.kodeBank} : ${pemilik.data.accountname} \n`
    } catch (err) {
      //
    }
  }

  await ctx.reply(`${msg}`)

})

bot.launch()

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))