const DEFAULT_PROFILE = {
  username: "c4k",
  profilePicture:
    "https://pekora.pro/images/thumbnails/cde7d687dfe66ede05674c3a86c35078282edc4f1dce6d61a2d74f44a23cbed0_headshot.png",

  bio: "i like making games and listening to music",
  status: "@c4k_.",

  wearing: {
    image:
      "https://pekora.pro/images/thumbnails/cde7d687dfe66ede05674c3a86c35078282edc4f1dce6d61a2d74f44a23cbed0_thumbnail.png",
    items: [
      {
        name: "Astronaut Helmet",
        image:
          "https://pekora.pro/images/thumbnails/2d4c5c0a1d18cf2ba93d6c694d0bc15beae57a06bc6e402f5ee11bbbb0fc38c8.png"
      }
    ]
  },

  friends: [
    {
      name: "10k",
      bubble: "",
      icon:
        "https://pekora.pro/images/thumbnails/5e03e03ee87bb086544bcbf938a9102a78f9136d7ee24949d4811e9604479b1e_headshot.png"
    },
    {
      name: "1547",
      bubble: "",
      icon:
        "https://pekora.pro/images/thumbnails/c4a35657450bf9ba49c40164a5a056909b9ed885b54f902090907dfe85f5d9b4_headshot.png"
    },
    {
      name: "1_1",
      bubble: "",
      icon:
        "https://pekora.pro/images/thumbnails/a8c613ab1723b862bfafac4df97a2b5698a04718cd1a89ef0938b0903f6ca4d5_headshot.png"
    },
    {
      name: "1d6g567",
      bubble: "",
      icon:
        "https://pekora.pro/images/thumbnails/082e9973697cff5b3b22800ee7969bc1cff7ea1877e97f6538f20d75c9313152_headshot.png"
    },
    {
      name: "2111pietro_PK",
      bubble: "",
      icon:
        "https://pekora.pro/images/thumbnails/72e9aee0ba62e0e3d8f08a1ca975ac23b8faa0807fad3c69b692d72f74c0cb3d_headshot.png"
    },
    {
      name: "2pac",
      bubble: "",
      icon:
        "https://pekora.pro/images/thumbnails/8248c000cd3c921eb482a93f1536319ea384d2244742ba09330d273d288eef0f_headshot.png"
    },
    {
      name: "5K0",
      bubble: "",
      icon:
        "https://pekora.pro/images/thumbnails/a18f2c7d0a44510ab2ebf30f9f042566a41469e4d5b9fdc9ed44fd273ef23351_headshot.png"
    },
    {
      name: "927",
      bubble: "",
      icon:
        "https://pekora.pro/images/thumbnails/03f382ee6017732d3c335bc4e238d653c650ec577e7746cb657144820e6401b6_headshot.png"
    }
  ],

  interests: [],

  collections: [
    {
      name: "Astronaut Helmet",
      image:
        "https://pekora.pro/images/thumbnails/2d4c5c0a1d18cf2ba93d6c694d0bc15beae57a06bc6e402f5ee11bbbb0fc38c8.png"
    }
  ],

  favoriteGames: [],

  // Added: "Profiles in Revivals" â€” same idea as best friends, but the
  // avatar image is resolved at request time from an external JSON API.
  revivals: [],

  statistics: {
    joinDate: "August 5th",
    placeVisits: "0",
    forumPosts: "0"
  },

  creations: [
    {
      name: "JuiceBlox",
      image: "https://i.imgur.com/VqVmV1i.png",
      bio: "2017-21 Sim.",
      place: "ROBLOX",
      link: "https://www.roblox.com/games/139440943517861/JuiceBlox"
    },
    {
      name: "MTOH",
      image:
        "https://madxka.com//images/thumbnails/cd666b6014843414fc23c04af8cd78f6c907bfb65679fbbd8a51519900f41835.png",
      bio: "Kiddie's Towers of Hell",
      place: "Madoka",
      link: "https://madxka.com/games/32095/MTOH"
    },
    {
      name: "Steal a Pekorian: Reborn",
      image: "https://pekora.pro/img/placeholder/icon_one.png",
      bio: "IN DEVELOPMENT!!",
      place: "Pekora: Reborn",
      link: "https://pekora.pro/games/31/Steal-a-Pekorian-Reborn"
    }
  ]
};

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function safeUrl(value) {
  try {
    const url = new URL(String(value || ""));

    if (url.protocol !== "http:" && url.protocol !== "https:") {
      return "#";
    }

    return url.href;
  } catch {
    return "#";
  }
}

// Added: resolves a simple JSON path like "data[0].imageUrl" against a
// parsed JSON object. Used by the "Profiles in Revivals" feature.
function resolveJsonPath(data, path) {
  if (!path) {
    return undefined;
  }

  const normalizedPath = String(path)
    .replace(/\[(\d+)\]/g, ".$1")
    .replace(/^\./, "");

  const parts = normalizedPath.split(".").filter(Boolean);

  let current = data;

  for (const part of parts) {
    if (current === null || current === undefined) {
      return undefined;
    }

    current = current[part];
  }

  return current;
}

// Added: fetches each revival profile's request link and resolves its
// avatar image via the configured JSON path. Never throws â€” a bad link
// or bad path just resolves to an empty image for that entry.
async function resolveRevivalImages(revivals) {
  if (!Array.isArray(revivals) || revivals.length === 0) {
    return [];
  }

  return Promise.all(
    revivals.map(async (revival) => {
      if (!revival.requestLink) {
        return { ...revival, resolvedImage: "" };
      }

      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);

        const response = await fetch(revival.requestLink, {
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        const contentType =
          response.headers.get("content-type") || "";

if (!response.ok || !contentType.includes("application/json")) {
  const body = await response.text();

  return {
    ...revival,
    resolvedImage: ""
  };
}

        const json = await response.json();
        const image = resolveJsonPath(
          json,
          revival.jsonProfileImage
        );

        return {
          ...revival,
          resolvedImage:
            typeof image === "string" ? image : ""
        };

      } catch (error) {
        console.log(
          "Erro ao buscar imagem:",
          revival.name,
          error.message
        );

        return {
          ...revival,
          resolvedImage: ""
        };
      }
    })
  );
}

function normalizeProfile(data) {
  const source = data && typeof data === "object" ? data : {};

  const wearingSource =
    source.wearing && typeof source.wearing === "object" ? source.wearing : {};

  const statisticsSource =
    source.statistics && typeof source.statistics === "object"
      ? source.statistics
      : {};

  const normalizeArray = (value, fallback) => {
    return Array.isArray(value) ? value : fallback;
  };

  const wearingItems = Array.isArray(wearingSource.items)
    ? wearingSource.items.slice(0, 50).map((item) => ({
        name: String(item?.name || "").slice(0, 150),
        image: String(item?.image || "").slice(0, 1000)
      }))
    : DEFAULT_PROFILE.wearing.items;

  return {
    username: String(source.username ?? DEFAULT_PROFILE.username).slice(0, 100),

    profilePicture: String(
      source.profilePicture ?? DEFAULT_PROFILE.profilePicture
    ).slice(0, 1000),

    bio: String(source.bio ?? DEFAULT_PROFILE.bio).slice(0, 2000),

    status: String(source.status ?? DEFAULT_PROFILE.status).slice(0, 200),

    wearing: {
      image: String(
        wearingSource.image ?? DEFAULT_PROFILE.wearing.image
      ).slice(0, 1000),

      items: wearingItems
    },

    friends: normalizeArray(source.friends, DEFAULT_PROFILE.friends)
      .slice(0, 100)
      .map((friend) => ({
        name: String(friend?.name || "").slice(0, 150),
        bubble: String(friend?.bubble || "").slice(0, 500),
        icon: String(friend?.icon || "").slice(0, 1000)
      })),

    interests: normalizeArray(source.interests, DEFAULT_PROFILE.interests)
      .slice(0, 100)
      .map((interest) => ({
        name: String(interest?.name || "").slice(0, 150),
        image: String(interest?.image || "").slice(0, 1000),
        link: String(interest?.link || "").slice(0, 1000)
      })),

    collections: normalizeArray(source.collections, DEFAULT_PROFILE.collections)
      .slice(0, 100)
      .map((item) => ({
        name: String(item?.name || "").slice(0, 150),
        image: String(item?.image || "").slice(0, 1000)
      })),

    favoriteGames: normalizeArray(
      source.favoriteGames,
      DEFAULT_PROFILE.favoriteGames
    )
      .slice(0, 100)
      .map((game) => ({
        name: String(game?.name || "").slice(0, 150),
        image: String(game?.image || "").slice(0, 1000),
        link: String(game?.link || "").slice(0, 1000)
      })),

    // Added: "Profiles in Revivals" normalization. resolvedImage is not
    // user-editable â€” it's filled in at request time by
    // resolveRevivalImages() and just passed through here.
    revivals: normalizeArray(source.revivals, DEFAULT_PROFILE.revivals)
      .slice(0, 100)
      .map((item) => ({
        name: String(item?.name || "").slice(0, 150),
        requestLink: String(item?.requestLink || "").slice(0, 1000),
        jsonProfileImage: String(item?.jsonProfileImage || "").slice(0, 300),
        bubble: String(item?.bubble || "").slice(0, 500),
        link: String(item?.link || "").slice(0, 1000),
        resolvedImage: String(item?.resolvedImage || "").slice(0, 1000)
      })),

    statistics: {
      joinDate: String(
        statisticsSource.joinDate ?? DEFAULT_PROFILE.statistics.joinDate
      ).slice(0, 150),

      placeVisits: String(
        statisticsSource.placeVisits ?? DEFAULT_PROFILE.statistics.placeVisits
      ).slice(0, 100),

      forumPosts: String(
        statisticsSource.forumPosts ?? DEFAULT_PROFILE.statistics.forumPosts
      ).slice(0, 100)
    },

    creations: normalizeArray(source.creations, DEFAULT_PROFILE.creations)
      .slice(0, 100)
      .map((creation) => ({
        name: String(creation?.name || "").slice(0, 150),
        image: String(creation?.image || "").slice(0, 1000),
        bio: String(creation?.bio || "").slice(0, 300),
        place: String(creation?.place || "").slice(0, 150),
        link: String(creation?.link || "").slice(0, 1000)
      }))
  };
}

function renderCreations(creations) {
  if (!Array.isArray(creations) || creations.length === 0) {
    return `<div class="emptySection">No creations yet.</div>`;
  }

  return creations
    .map((creation) => {
      const name = escapeHtml(creation.name || "Untitled");
      const image = escapeHtml(safeUrl(creation.image));
      const bio = escapeHtml(creation.bio || "");
      const place = escapeHtml(creation.place || "");
      const link = escapeHtml(safeUrl(creation.link));

      return `
        <div class="gameCardContainer">
          <a href="${link}" class="gameCardLink">
            <div class="gameCardThumbContainer">
              <img src="${image}" alt="${name}">
            </div>
            <div class="gameCardTitle" title="${name}">
              ${name}
            </div>
            <div class="gameCardPlaying">
              <p class="playerCount">
                ${bio}
              </p>
            </div>
            <div class="gameCardVote">
              <div class="voteBar">
                <div class="voteThumbsUp">
                  <span class="icon-thumbs-up">â–²</span>
                </div>
                <div class="voteContainer">
                  <div class="voteBackground"></div>
                  <div class="votePercentage"></div>
                  <div>
                    <div class="segment seg1"></div>
                    <div class="segment seg2"></div>
                    <div class="segment seg3"></div>
                    <div class="segment seg4"></div>
                  </div>
                </div>
                <div class="voteThumbsDown">
                  <span class="icon-thumbs-down">â–¼</span>
                </div>
              </div>
            </div>
          </a>

          <div class="gameCardFooterContainer">
            <div class="voteCounts">
              <div class="downvoteCount">0</div>
              <div class="upvoteCount">0</div>
            </div>

            <div class="gameCardFooter">
              <div class="gameCreator">
                <p class="gameFooterText">
                  In <span class="quoted">"${place}"</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      `;
    })
    .join("");
}

function renderFriends(friends) {
  if (!Array.isArray(friends) || friends.length === 0) {
    return `<div class="emptySection">I'm still deciding who will be here.</div>`;
  }

  return friends
    .map((friend, index) => {
      const name = escapeHtml(friend.name || "Unnamed");
      const icon = escapeHtml(safeUrl(friend.icon));
      const bubble = escapeHtml(friend.bubble || "");

      // Fix: clicking a best friend now opens the modal popup
      // (#friendPopupOverlay) instead of the old, broken inline bubble
      // toggle. The name/message are passed via data attributes and read
      // by openFriendPopup() in the page's <script>.
      return `
        <li class="friend">
          <a
            href="#friend-${index}"
            class="friendLink"
            data-friend-name="${name}"
            data-friend-message="${bubble}"
            onclick="openFriendPopup(event, this)"
          >
          ${bubble ? `<div class="friendBubble">${bubble}</div>` : ""}
          
            <div class="friendAvatar">
              <img src="${icon}" alt="${name}">
            </div>

            <div class="friendName link2019">
              ${name}
            </div>
          </a>
        </li>
      `;
    })
    .join("");
}

function renderInterests(interests) {
  if (!Array.isArray(interests) || interests.length === 0) {
    return `<div class="emptySection">No interests yet.</div>`;
  }

  return interests
    .map((interest) => {
      const name = escapeHtml(interest.name || "Unnamed");
      const image = escapeHtml(safeUrl(interest.image));
      const link = escapeHtml(safeUrl(interest.link));

      return `
        <a href="${link}" class="interestItem" target="_blank" rel="noopener noreferrer">
          <div class="interestImageWrapper">
            <img src="${image}" alt="${name}" class="interestImage">
          </div>
          <p class="interestLabel link2019">
            ${name}
          </p>
        </a>
      `;
    })
    .join("");
}

function renderCollections(collections) {
  if (!Array.isArray(collections) || collections.length === 0) {
    return `<div class="emptySection">No collections yet.</div>`;
  }

  return collections
    .map((item) => {
      const name = escapeHtml(item.name || "Unnamed");
      const image = escapeHtml(safeUrl(item.image));

      return `
        <div class="collectionItem">
          <div class="collectionImageWrapper">
            <img class="collectionImage" src="${image}" alt="${name}">
          </div>
          <p class="collectionLabel link2019">
            ${name}
          </p>
        </div>
      `;
    })
    .join("");
}

function renderFavoriteGames(games) {
  if (!Array.isArray(games) || games.length === 0) {
    return `<div class="emptySection">User has no favourited games.</div>`;
  }

  return games
    .map((game) => {
      const name = escapeHtml(game.name || "Unnamed");
      const image = escapeHtml(safeUrl(game.image));
      const link = escapeHtml(safeUrl(game.link));

      return `
        <a href="${link}" class="collectionItem" target="_blank" rel="noopener noreferrer">
          <div class="collectionImageWrapper">
            <img class="collectionImage" src="${image}" alt="${name}">
          </div>
          <p class="collectionLabel link2019">
            ${name}
          </p>
        </a>
      `;
    })
    .join("");
}

// Added: renders the "Profiles in Revivals" list. Visually the same box
// style as Best Friends (.friend / .friendAvatar / .friendName), but not
// clickable, and the image comes from resolvedImage (set server-side by
// resolveRevivalImages()) instead of a manually-entered icon URL.
function renderRevivals(revivals) {
  if (!Array.isArray(revivals) || revivals.length === 0) {
    return `<div class="emptySection">No profiles in revivals yet.</div>`;
  }

  return revivals
    .map((revival) => {
      const name = escapeHtml(revival.name || "Unnamed");
      const image = escapeHtml(safeUrl(revival.resolvedImage));
      const bubble = escapeHtml(revival.bubble || "");

      return `
<li class="friend">
  <a
    href="${escapeHtml(safeUrl(revival.link))}"
    class="friendLink"
    target="_blank"
    rel="noopener noreferrer"
  >
    ${bubble ? `<div class="friendBubble">${bubble}</div>` : ""}

    <div class="friendAvatar">
      <img src="${image}" alt="${name}">
    </div>

    <div class="friendName link2019">
      ${name}
    </div>
  </a>
</li>
      `;
    })
    .join("");
}

function renderWearingItems(items) {
  if (!Array.isArray(items) || items.length === 0) {
    return "";
  }

  return items
    .map((item) => {
      const name = escapeHtml(item.name || "Unnamed");
      const image = escapeHtml(safeUrl(item.image));

      return `
        <div class="itemCard">
          <img class="itemImage" src="${image}" alt="${name}">
          <p class="itemName">
            ${name}
          </p>
        </div>
      `;
    })
    .join("");
}

function renderProfile(data) {
  const profile = normalizeProfile(data);

  const username = escapeHtml(profile.username);
  const profilePicture = escapeHtml(safeUrl(profile.profilePicture));
  const wearingImage = escapeHtml(safeUrl(profile.wearing.image));
  const bio = escapeHtml(profile.bio);
  const status = escapeHtml(profile.status);
  const joinDate = escapeHtml(profile.statistics.joinDate);
  const placeVisits = escapeHtml(profile.statistics.placeVisits);
  const forumPosts = escapeHtml(profile.statistics.forumPosts);

  return HTML.replaceAll("{{USERNAME}}", username)
    .replaceAll("{{PROFILE_PICTURE}}", profilePicture)
    .replace("{{STATUS}}", status)
    .replace("{{BIO}}", bio)
    .replace("{{WEARING_IMAGE}}", wearingImage)
    .replace("{{WEARING_ITEMS}}", renderWearingItems(profile.wearing.items))
    .replace("{{FRIENDS}}", renderFriends(profile.friends))
    .replace("{{REVIVALS}}", renderRevivals(profile.revivals))
    .replace("{{INTERESTS}}", renderInterests(profile.interests))
    .replace("{{COLLECTIONS}}", renderCollections(profile.collections))
    .replace("{{FAVORITE_GAMES}}", renderFavoriteGames(profile.favoriteGames))
    .replace("{{JOIN_DATE}}", joinDate)
    .replace("{{PLACE_VISITS}}", placeVisits)
    .replace("{{FORUM_POSTS}}", forumPosts)
    .replace("{{CREATIONS}}", renderCreations(profile.creations))
    .replace("{{BEST_FRIEND_COUNT}}", String(profile.friends.length));
}

async function getProfile(env) {
  if (!env.PROFILE_DATA) {
    return normalizeProfile(DEFAULT_PROFILE);
  }

  try {
    const data = await env.PROFILE_DATA.get("profile", "json");

    if (!data || typeof data !== "object") {
      return normalizeProfile(DEFAULT_PROFILE);
    }

    return normalizeProfile(data);
  } catch {
    return normalizeProfile(DEFAULT_PROFILE);
  }
}

function base64UrlEncode(bytes) {
  let binary = "";

  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }

  return btoa(binary)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function base64UrlDecode(value) {
  const padded =
    value.replace(/-/g, "+").replace(/_/g, "/") +
    "===".slice((value.length + 3) % 4);

  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);

  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }

  return bytes;
}

async function createAdminToken(password) {
  const timestamp = String(Date.now());

  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(password),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(timestamp)
  );

  return timestamp + "." + base64UrlEncode(new Uint8Array(signature));
}

async function verifyAdminToken(token, password) {
  if (!token || !
