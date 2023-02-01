const { exec } = require('child_process')
const { env } = require('process')

async function execCmd(cmd) {
    await new Promise((resolve, reject) => {
        const proc = exec(cmd, { env: process.env }, err => (err ? reject(err) : resolve()))

        proc.stdout.pipe(process.stdout)
        proc.stderr.pipe(process.stderr)
    })
}

(async () => {
    // await execCmd('npm run db:create')
    await execCmd('npm run db:migrate')
    await execCmd('npm run db:seed')
})()
