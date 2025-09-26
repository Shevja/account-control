<script setup lang="ts">
import {Button, Column, DataTable, InputText, Message, Select, Textarea} from "primevue";
import {onMounted, ref} from "vue";
import type {Account, RecordType, Tag} from "@/models/accounts"
import {useAccountsStore} from "@/stores/accounts.ts";

const accounts = ref<Account[]>([])
const accountsStore = useAccountsStore()
const isLoading = ref<boolean>(true)

const recordTypes: RecordType[] = [
    {label: 'Локальная', value: 'local'},
    {label: 'LDAP', value: 'LDAP'},
];

function onAddAccount(): void {
    // Берем последний известный id, и добавляем 1
    // если список пуст то задаем 0
    const lastAccount = accounts.value[accounts.value.length - 1];
    const lastId = lastAccount ? lastAccount.id + 1 : 0

    const newAccount: Account = {
        id: lastId,
        login: '',
        password: '',
        tags: [],
        recordType: 'local',
        loginError: false,
        passwordError: false,
    }

    accounts.value.push(newAccount)
}

function onDeleteAccount(id: number): void {
    const idx = accounts.value.findIndex(account => account.id === id)
    accounts.value.splice(idx, 1)
    accountsStore.removeAccount(id)
}

function onRecordTypeChange(account: Account): void {
    if (account.recordType === 'LDAP') {
        account.password = null
    } else {
        account.password = ''
    }
}

function parseTags(tags: string): Tag[] {
    return tags
        .split(';')
        .map(tag => ({text: tag.trim()}))
        .filter(tag => !!tag.text)
}

function validateAccountForm(account: Account): boolean {
    // Проверка что логин и пароль:
    // 1. не пустые
    // 2. их длина не больше 100 символов
    // 3. тип аккаунта не LDAP (для пароля)

    account.loginError = !account.login || account.login.length > 100
    account.passwordError =
        account.recordType === 'local' &&
        (!account.password || account.password.length > 100)

    return !(account.loginError || account.passwordError)
}

function onAccountChange(account: Account): void {
    onRecordTypeChange(account);
    saveAccount(account);
}

function saveAccount(account: Account): void {
    if (validateAccountForm(account)) {
        console.log('save account', account)
        accountsStore.saveAccount(account)
    }
}

function getData(): Account[] {
    accountsStore.loadAccounts()
    return accountsStore.accounts
}

onMounted(() => {
    // fetch data
    accounts.value.push(...getData())

    accounts.value.forEach(account => {
        account.loginError = false
        account.passwordError = false
    })

    isLoading.value = false
})
</script>

<template>
    <section class="py-10">
        <div class="container mx-auto">

            <div class="flex gap-4 items-center mb-3">
                <h2 class="text-xl font-semibold">Учетные записи</h2>
                <Button icon="pi pi-plus" aria-label="Save" variant="outlined" @click="onAddAccount"/>
            </div>

            <Message class="mb-4" severity="secondary">
                <div class="flex gap-2">
                    <span class="pi pi-question-circle !text-xl"/>
                    <span>
                        Для указания нескольких меток для одной пары
                        логин/пароль используйте раделитель ;
                    </span>
                </div>
            </Message>

            <DataTable
                :value="accounts"
                :loading="isLoading"
                :rows="5"
                :rows-per-page-options="[5, 10, 20]"
                size="small"
                dataKey="id"
                paginator
            >
                <template #empty>
                    <div class="text-center">Список пуст</div>
                </template>
                <template #loading>
                    <div>Данные загружаются</div>
                </template>

                <!--Метки-->
                <Column field="tags" header="Метки">
                    <template #body="slotProps">
                        <Textarea
                            :model-value="slotProps.data.tags.map(t => t.text).join('; ')"
                            @update:model-value="val => slotProps.data.tags = parseTags(val)"
                            autoResize
                            rows="1"
                            class="w-full"
                            placeholder="Метки"
                            maxlength="50"
                            @blur="saveAccount(slotProps.data)"
                        />
                    </template>
                </Column>

                <!-- Тип записи -->
                <Column field="record_type" header="Тип записи">
                    <template #body="slotProps">
                        <Select
                            v-model="slotProps.data.recordType"
                            :options="recordTypes"
                            optionLabel="label"
                            optionValue="value"
                            class="w-full"
                            placeholder="Тип записи"
                            @change="onAccountChange(slotProps.data)"
                        />
                    </template>
                </Column>

                <!-- Логин -->
                <Column field="login" header="Логин">
                    <template #body="slotProps">
                        <InputText
                            v-model="slotProps.data.login"
                            class="w-full"
                            placeholder="Логин"
                            required
                            :invalid="slotProps.data.loginError"
                            @blur="saveAccount(slotProps.data)"
                        />
                    </template>
                </Column>

                <!-- Пароль, если не LDAP -->
                <Column
                    field="password"
                    header="Пароль"
                >
                    <template #body="slotProps">
                        <InputText
                            v-if="slotProps.data.recordType !== 'LDAP'"
                            v-model="slotProps.data.password"
                            class="w-full"
                            placeholder="Пароль"
                            required
                            :invalid="slotProps.data.passwordError"
                            @blur="saveAccount(slotProps.data)"
                        />
                    </template>
                </Column>

                <!-- Кнопка удаления записи -->
                <Column>
                    <template #body="slotProps">
                        <Button icon="pi pi-trash" variant="link" @click="onDeleteAccount(slotProps.data.id)"/>
                    </template>
                </Column>

                <!-- Пагинация -->

            </DataTable>
        </div>
    </section>
    <pre>
        {{ accounts }}
    </pre>
</template>
