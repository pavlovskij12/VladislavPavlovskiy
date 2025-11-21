async function inviteUserToRoom() {
  if (!this.inviteUser?.trim() || !this.roomId) return;

  try {
    const res = await fetch(
      `https://matrix.org/_matrix/client/r0/rooms/${this.roomId}/invite`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.accessToken}`
        },
        body: JSON.stringify({ user_id: this.inviteUser.trim() })
      }
    );

    const data = await res.json();

    if (!data.errcode) {
      alert(`${this.inviteUser} invited to ${this.roomId}`);
      this.inviteUser = '';
      await this.fetchRoomsWithNames?.();
      await this.fetchRoomMembers?.();
    } else {
      alert('Invite failed: ' + (data.error || 'Unknown error'));
    }
  } catch (e) {
    alert('Invite error: ' + e.message);
  }
}

async function joinRoom() {
  if (!this.joinRoomId?.trim()) return;

  try {
    const roomId = this.joinRoomId.trim();
    const res = await fetch(
      `https://matrix.org/_matrix/client/r0/join/${encodeURIComponent(roomId)}`,
      {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${this.accessToken}` }
      }
    );

    const data = await res.json();

    if (data.room_id) {
      this.roomId = roomId;
      this.joinRoomId = '';
      this.messages = [];
      this.lastSyncToken = '';
      await this.fetchRoomsWithNames?.();
      await this.fetchRoomMembers?.();
      this.fetchMessages?.();
    } else {
      alert('Join failed: ' + (data.error || 'Unknown error'));
    }
  } catch (e) {
    alert('Join room error: ' + e.message);
  }
}

// Отримання учасників кімнати
async function fetchRoomMembers() {
  if (!this.accessToken || !this.roomId) return;

  try {
    const res = await fetch(
      `https://matrix.org/_matrix/client/r0/rooms/${encodeURIComponent(this.roomId)}/joined_members`,
      { headers: { 'Authorization': `Bearer ${this.accessToken}` } }
    );

    const data = await res.json();

    this.roomMembers = Object.entries(data.joined || {}).map(
      ([userId, info]) => ({
        userId,
        displayName:
          info?.display_name || userId.split(':')[0].substring(1),
        avatarUrl: info?.avatar_url || null
      })
    );
  } catch (e) {
    console.error('Error fetching room members:', e);
  }
}

// Видалення (kick) користувача з кімнати
async function kickUser(userId) {
  if (!this.accessToken || !this.roomId || !userId) return;

  if (!confirm(`Викинути користувача ${userId} з кімнати?`)) {
    return;
  }

  try {
    const res = await fetch(
      `https://matrix.org/_matrix/client/r0/rooms/${encodeURIComponent(this.roomId)}/kick`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.accessToken}`
        },
        body: JSON.stringify({ user_id: userId })
      }
    );

    const data = await res.json();

    if (res.ok) {
      // Успішно викинуто
      this.roomMembers = this.roomMembers.filter(
        m => m.userId !== userId
      );
      alert(`Користувач ${userId} викинутий з кімнати.`);
      await this.fetchRoomMembers(); // Оновлюємо список
    } else {
      console.error('Kick failed:', data);
      alert(
        'Не вдалося викинути користувача: ' +
          (data.error || 'Невідома помилка')
      );
    }
  } catch (e) {
    console.error('Kick error:', e);
    alert('Помилка: ' + e.message);
  }
}

// робимо функції доступними глобально (для Alpine)
window.inviteUserToRoom = inviteUserToRoom;
window.joinRoom = joinRoom;
window.fetchRoomMembers = fetchRoomMembers;
window.kickUser = kickUser;
