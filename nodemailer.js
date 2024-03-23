const nodemailer=require("nodemailer")

const html=`
<h1>Welcome to Kisaan Mart</h1>
<p>Account Crreated Successfully</p>`

async function main(){
nodemailer.createTransport({
    host:""
})
}
main()