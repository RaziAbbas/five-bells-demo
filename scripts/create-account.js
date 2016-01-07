#!/usr/bin/env node
'use strict'

const co = require('co')
const request = require('co-request')
const ledger = process.env.LEDGER
const username = process.env.USERNAME
const adminUser = process.env.ADMIN_USER
const adminPass = process.env.ADMIN_PASS

if (!ledger || !username || !adminUser || !adminPass) {
  console.error('usage: create-account.js')
  console.error('required env variables:')
  console.error('  LEDGER')
  console.error('  USERNAME')
  console.error('  ADMIN_USER')
  console.error('  ADMIN_PASS')
  process.exit(1)
}

co(createAccount, ledger, username)
  .catch(function (err) {
    console.error(err.stack)
    process.exit(1)
  })

function * createAccount (ledger, name) {
  let account_uri = ledger + '/accounts/' + encodeURIComponent(name)
  let getAccountRes = yield request({
    method: 'get',
    url: account_uri,
    json: true
  })
  if (getAccountRes.statusCode === 200) {
    return
  }

  let putAccountRes = yield request({
    method: 'put',
    url: account_uri,
    auth: { user: adminUser, pass: adminPass },
    json: true,
    body: {
      name: account_uri,
      password: name,
      balance: '1500000'
    }
  })
  if (putAccountRes.statusCode >= 400) {
    throw new Error('Unexpected status code ' + putAccountRes.statusCode)
  }
}
