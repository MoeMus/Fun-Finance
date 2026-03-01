
async function feed_dragon(access_token){

  const response = await fetch('http://127.0.0.1:5000/dragon/feed', {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${access_token}`
    }
  });

  if (!response.ok) {
    const error_msg = await response.json();
    throw new Error(error_msg.error);
  }
  const dragon_data = await response.json();

  return dragon_data;

}

async function play_with_dragon(access_token){

  const response = await fetch('http://127.0.0.1:5000/dragon/play', {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${access_token}`
    }
  });

  if (!response.ok) {
    const error_msg = await response.json();
    throw new Error(error_msg.error);
  }
  const dragon_data = await response.json();

  return dragon_data;

}

async function pet_dragon(access_token) {
    const response = await fetch('http://127.0.0.1:5000/dragon/pet', {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${access_token}`
    }
  });

  if (!response.ok) {
    const error_msg = await response.json();
    throw new Error(error_msg.error);
  }
  const dragon_data = await response.json();

  return dragon_data;
}

async function wash_dragon(access_token) {
    const response = await fetch('http://127.0.0.1:5000/dragon/wash', {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${access_token}`
    }
  });

  if (!response.ok) {
    const error_msg = await response.json();
    throw new Error(error_msg.error);
  }
  const dragon_data = await response.json();

  return dragon_data;
}

async function random_event(access_token, action) {
  const response = await fetch('http://127.0.0.1:5000/dragon/change', {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${access_token}`
    },
    body: JSON.stringify({action: action})
  });

  if (!response.ok) {
    const error_msg = await response.json();
    throw new Error(error_msg.error);
  }
  const dragon_data = await response.json();

  return dragon_data;

}

async function apply_prev_days_effects (access_token, last_login_date, mood){
  const lastLoginDate = last_login_date.toDate();
  const now = new Date();

  const diffMs = now - lastLoginDate; // difference in milliseconds
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays <= 1) return;

  let dragon_data;

  const response = await fetch('https://127.0.0.1:5000/dragon/update-mood/stack', {
    method: 'POST',
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${access_token}`
    },
    body: JSON.stringify({ ...mood, times: diffDays })
  });

  if (!response.ok) {
    const error_msg = await response.json();
    throw new Error(error_msg.error);
  }

  dragon_data = await response.json();

  return dragon_data;

}


export {feed_dragon, play_with_dragon, pet_dragon, wash_dragon, random_event, apply_prev_days_effects}