import {defineStore} from 'pinia'
import type {Account} from "@/models/accounts.ts";

export const useAccountsStore = defineStore('accounts', {
    state: () => {
        return {
            accounts: [] as Account[],
            count: 0,
        }
    },

    actions: {
        saveAccount(account: Account) {
            const accountIndex = this.accounts.findIndex(acc => acc.id === account.id)

            accountIndex !== -1
                ? this.accounts[accountIndex] = account
                : this.accounts.push(account)

            localStorage.setItem('accounts', JSON.stringify(this.accounts));
        },
        removeAccount(id: number) {
            const accountIndex = this.accounts.findIndex(account => account.id === id)

            if (accountIndex !== -1) {
                this.accounts.splice(accountIndex, 1)
            }

            localStorage.setItem('accounts', JSON.stringify(this.accounts));
        },
        loadAccounts() {
            const accounts: string | null = localStorage.getItem('accounts')

            if (accounts) {
                this.accounts = JSON.parse(accounts);
            }
        }
    }
})