import { signal, computed } from '@angular/core';

interface UserStore {
  users: ReturnType<typeof signal<any[]>>;
  setUsers: (users: any[]) => void;
  filteredUsers: ReturnType<typeof computed>;
}

export const userStore = {} as UserStore;

userStore.users = signal<any[]>([]);
userStore.setUsers = (users: any[]) => userStore.users.set(users);
userStore.filteredUsers = computed(() => userStore.users());
