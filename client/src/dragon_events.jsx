
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

async function apply_prev_days_effects (access_token, last_login_date){
  const daysSince = last_login_date === null ? 0 : Math.floor((Date.now() - last_login_date) / 86400000);

  if (daysSince <= 5) return;

   const dragon_response = await fetch('https://127.0.0.1:5000/dragon/get', {
    method: 'GET',
    headers: {
      "Authorization": `Bearer ${access_token}`
    },
  });
  let dragon_data = await dragon_response.json();

  const response = await fetch('https://127.0.0.1:5000/dragon/update-mood/stack', {
    method: 'POST',
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${access_token}`
    },
    body: JSON.stringify({ ...dragon_data.mood, times: daysSince })
  });

  if (!response.ok) {
    const error_msg = await response.json();
    throw new Error(error_msg.error);
  }

  dragon_data = await response.json();

  return dragon_data;

}


export {feed_dragon, play_with_dragon, pet_dragon, wash_dragon, random_event, apply_prev_days_effects}