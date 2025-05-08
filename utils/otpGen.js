const generateOtP = ()=>{
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    const timeStamp = Date.now().toString()

    let otp = ''

    for( let i = 0; i < 6; i++){
        const seed = parseInt(timeStamp.charAt(i % timeStamp.length))
        const randIndex = (Math.floor(Math.random() * chars.length ) + seed) % chars.length

        otp += chars.charAt(randIndex)
    }

    return otp
}


module.exports = generateOtP