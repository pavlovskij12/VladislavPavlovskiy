



function getRoomName(roomId) {
  return this.rooms.find(r => r.roomId === roomId)?.name || roomId;
}

/** Перемкнути активну кімнату та оновити дані */
function switchRoom(roomId) {
  if (roomId) this.roomId = roomId;
  this.messages = [];
  this.lastSyncToken = '';
  // тягнемо повідомлення та список учасників (функція у user.js)
  this.fetchMessages?.();
  this.fetchRoomMembers?.();
}

/** Створити нову кімнату */
async function createRoom() {
  if (!this.accessToken) {
    alert('Спочатку увійдіть у систему');
    return;
  }
  const name = (this.newRoomName || '').trim();
  if (!name) {
    alert('Введіть назву кімнати');
    return;
  }

  try {
    const res = await fetch('https://matrix.org/_matrix/client/r0/createRoom', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.accessToken}`
      },
      body: JSON.stringify({
        name,
        preset: 'private_chat' // або 'public_chat' якщо треба
      })
    });
    const data = await res.json();
    if (data.room_id) {
      this.newRoomId = data.room_id;
      this.roomId = data.room_id;
      this.newRoomName = '';
      await this.fetchRoomsWithNames();
      this.fetchMessages?.();
      this.fetchRoomMembers?.();
    } else {
      console.error('Create room failed:', data);
      alert('Create room failed: ' + (data.error || 'Unknown error'));
    }
  } catch (e) {
    console.error('Create room error:', e);
    alert('Create room error: ' + e.message);
  }
}

/** Отримати список приєднаних кімнат із назвами */
async function fetchRoomsWithNames() {
  if (!this.accessToken) return;

  try {
    // 1) список приєднаних кімнат
    const joined = await fetch('https://matrix.org/_matrix/client/r0/joined_rooms', {
      headers: { 'Authorization': `Bearer ${this.accessToken}` }
    }).then(r => r.json());

    const roomIds = joined?.joined_rooms || [];
    const out = [];

    // 2) для кожної кімнати — пробуємо дістати m.room.name
    for (const id of roomIds) {
      let name = '';
      try {
        const st = await fetch(
          `https://matrix.org/_matrix/client/r0/rooms/${encodeURIComponent(id)}/state/m.room.name`,
          { headers: { 'Authorization': `Bearer ${this.accessToken}` } }
        );
        if (st.ok) {
          const j = await st.json();
          name = j?.name || '';
        }
      } catch (_) { /* ignore */ }

      out.push({ roomId: id, name: name || id });
    }

    this.rooms = out.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
  } catch (e) {
    console.error('fetchRoomsWithNames error:', e);
  }
}

/* Робимо функції глобальними для Alpine (x-data) */
window.getRoomName = getRoomName;
window.switchRoom = switchRoom;
window.createRoom = createRoom;
window.fetchRoomsWithNames = fetchRoomsWithNames;
