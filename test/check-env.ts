import './env-setup'

console.log('--- ENV CHECK ---')
console.log('AWS_ACCESS_KEY_ID:', process.env.AWS_ACCESS_KEY_ID)
console.log('AWS_SECRET_ACCESS_KEY:', process.env.AWS_SECRET_ACCESS_KEY ? '******' : 'UNDEFINED')
console.log('AWS_REGION:', process.env.AWS_REGION)
