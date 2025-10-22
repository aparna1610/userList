import { Component, inject, OnInit, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { UserService } from '../../core/services/user.service';
import { userStore } from '../../core/state/user-store.signal';
import { Router, ActivatedRoute } from '@angular/router';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ScrollingModule],
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.css']
})
export class UserListComponent implements OnInit {
  private userService = inject(UserService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  searchControl = new FormControl('');
  users = userStore.users;

  searchTerm = signal('');

  filteredUsers = computed(() => {
    const term = this.searchTerm().toLowerCase().trim();
    if (!term) return this.users();
    return this.users().filter(u => u.name.toLowerCase().includes(term));
  });

  ngOnInit(): void {
    // Fetch users once
    if (this.users().length === 0) {
      this.userService.getUsers().subscribe({
        next: (data) => userStore.setUsers(data),
        error: (err) => console.error('Failed to load users', err)
      });
    }

    const initial = this.route.snapshot.queryParamMap.get('search') ?? '';
    this.searchControl.setValue(initial, { emitEvent: false });
    this.searchTerm.set(initial);

    this.searchControl.valueChanges
      .pipe(debounceTime(300), distinctUntilChanged())
      .subscribe(value => {
        const term = value || '';
        this.searchTerm.set(term);
        this.router.navigate([], { queryParams: { search: term || null }, queryParamsHandling: 'merge' });
      });
  }
}
