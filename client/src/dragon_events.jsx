
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

export {feed_dragon, play_with_dragon, pet_dragon, wash_dragon}