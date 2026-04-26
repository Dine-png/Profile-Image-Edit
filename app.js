const state = {
  image: null,
  imageName: "",
  zoom: 1,
  offsetX: 0,
  offsetY: 0,
  rotation: 0,
  brightness: 100,
  contrast: 100,
  saturation: 100,
  backgroundColor: "#ffffff",
  activePlatform: "x",
  dragging: false,
  dragStartX: 0,
  dragStartY: 0,
  dragOriginX: 0,
  dragOriginY: 0,
};

const editorCanvas = document.querySelector("#editorCanvas");
const editorCtx = editorCanvas.getContext("2d");
const imageInput = document.querySelector("#imageInput");
const imageMeta = document.querySelector("#imageMeta");
const resetButton = document.querySelector("#resetButton");
const export400Button = document.querySelector("#export400Button");
const export800Button = document.querySelector("#export800Button");
const languageSelect = document.querySelector("#languageSelect");

const controls = {
  zoom: bindControl("zoomRange", "zoomValue", (value) => `${Math.round(value * 100)}%`),
  offsetX: bindControl("offsetXRange", "offsetXValue", (value) => `${value}px`),
  offsetY: bindControl("offsetYRange", "offsetYValue", (value) => `${value}px`),
  rotation: bindControl("rotationRange", "rotationValue", (value) => `${value} deg`),
  brightness: bindControl("brightnessRange", "brightnessValue", (value) => `${value}%`),
  contrast: bindControl("contrastRange", "contrastValue", (value) => `${value}%`),
  saturation: bindControl("saturationRange", "saturationValue", (value) => `${value}%`),
  backgroundColor: {
    input: document.querySelector("#backgroundColor"),
    output: document.querySelector("#backgroundColorValue"),
  },
};

const previewCanvases = Array.from(document.querySelectorAll("[data-avatar-size]")).map((canvas) => ({
  canvas,
  size: Number(canvas.dataset.avatarSize),
  addFrame: canvas.dataset.avatarFrame === "true",
}));
const platformTabs = Array.from(document.querySelectorAll("[data-platform-tab]"));
const platformViews = Array.from(document.querySelectorAll("[data-platform-view]"));
const textTargets = {
  languageLabel: document.querySelector("#languageLabel"),
  heroTitle: document.querySelector("#heroTitle"),
  heroCopy: document.querySelector("#heroCopy"),
  editTitle: document.querySelector("#editTitle"),
  editCopy: document.querySelector("#editCopy"),
  loadImageLabel: document.querySelector("#loadImageLabel"),
  resetButton,
  stageHelpOuter: document.querySelector("#stageHelpOuter"),
  stageHelpInner: document.querySelector("#stageHelpInner"),
  zoomLabel: document.querySelector("#zoomLabel"),
  offsetXLabel: document.querySelector("#offsetXLabel"),
  offsetYLabel: document.querySelector("#offsetYLabel"),
  rotationLabel: document.querySelector("#rotationLabel"),
  brightnessLabel: document.querySelector("#brightnessLabel"),
  contrastLabel: document.querySelector("#contrastLabel"),
  saturationLabel: document.querySelector("#saturationLabel"),
  backgroundColorLabel: document.querySelector("#backgroundColorLabel"),
  export400Button,
  export800Button,
  metaNote: document.querySelector("#metaNote"),
  previewTitle: document.querySelector("#previewTitle"),
  previewCopy: document.querySelector("#previewCopy"),
  previewNote: document.querySelector("#previewNote"),
  xComposerTitle: document.querySelector("#xComposerTitle"),
  xComposerInput: document.querySelector("#xComposerInput"),
  xTimelineTitle: document.querySelector("#xTimelineTitle"),
  xTimelineMeta: document.querySelector("#xTimelineMeta"),
  xTimelineBody: document.querySelector("#xTimelineBody"),
  xNotificationTitle: document.querySelector("#xNotificationTitle"),
  xNotificationBody: document.querySelector("#xNotificationBody"),
  xMicroTitle: document.querySelector("#xMicroTitle"),
  xMicroBody: document.querySelector("#xMicroBody"),
  xProfileTitle: document.querySelector("#xProfileTitle"),
  xProfileBody: document.querySelector("#xProfileBody"),
  xTipsTitle: document.querySelector("#xTipsTitle"),
  xTip1: document.querySelector("#xTip1"),
  xTip2: document.querySelector("#xTip2"),
  xTip3: document.querySelector("#xTip3"),
  xTip4: document.querySelector("#xTip4"),
  discordSidebarTitle: document.querySelector("#discordSidebarTitle"),
  discordSidebarStatus: document.querySelector("#discordSidebarStatus"),
  discordChatTitle: document.querySelector("#discordChatTitle"),
  discordChatMeta: document.querySelector("#discordChatMeta"),
  discordChatBody: document.querySelector("#discordChatBody"),
  discordPopoutTitle: document.querySelector("#discordPopoutTitle"),
  discordPopoutStatus: document.querySelector("#discordPopoutStatus"),
  discordTipsTitle: document.querySelector("#discordTipsTitle"),
  discordTip1: document.querySelector("#discordTip1"),
  discordTip2: document.querySelector("#discordTip2"),
  discordTip3: document.querySelector("#discordTip3"),
  instagramStoryTitle: document.querySelector("#instagramStoryTitle"),
  instagramDmTitle: document.querySelector("#instagramDmTitle"),
  instagramDmBody: document.querySelector("#instagramDmBody"),
  instagramProfileTitle: document.querySelector("#instagramProfileTitle"),
  instagramStatPosts: document.querySelector("#instagramStatPosts"),
  instagramStatFollowers: document.querySelector("#instagramStatFollowers"),
  instagramStatFollowing: document.querySelector("#instagramStatFollowing"),
  instagramTipsTitle: document.querySelector("#instagramTipsTitle"),
  instagramTip1: document.querySelector("#instagramTip1"),
  instagramTip2: document.querySelector("#instagramTip2"),
  instagramTip3: document.querySelector("#instagramTip3"),
};
const platformTabLabels = {
  x: platformTabs.find((button) => button.dataset.platformTab === "x"),
  discord: platformTabs.find((button) => button.dataset.platformTab === "discord"),
  instagram: platformTabs.find((button) => button.dataset.platformTab === "instagram"),
};
const revealTargets = Array.from(document.querySelectorAll(".hero, .panel, .mock-card"));
const avatarCacheCanvas = document.createElement("canvas");
avatarCacheCanvas.width = 400;
avatarCacheCanvas.height = 400;
const avatarCacheCtx = avatarCacheCanvas.getContext("2d");
let avatarCacheDirty = true;
let renderQueued = false;
const translations = {
  ko: {
    documentTitle: "X 프로필 사진 미리보기 툴",
    htmlLang: "ko",
    languageLabel: "언어",
    heroTitle: "X 프로필 사진 미리보기 툴",
    heroCopy: "인증 계정에서 프로필 사진을 바꾸기 전, 작은 노출 영역까지 먼저 확인하고 마음에 들면 바로 내보낼 수 있는 로컬 웹앱입니다.",
    editTitle: "편집",
    editCopy: "이미지를 넣고 위치를 드래그해서 맞춰보세요.",
    loadImageLabel: "이미지 불러오기",
    resetButton: "초기화",
    stageHelpOuter: "바깥 원: 실제 원형 크롭",
    stageHelpInner: "안쪽 원: 작은 크기 안전영역",
    zoomLabel: "확대",
    offsetXLabel: "좌우 이동",
    offsetYLabel: "상하 이동",
    rotationLabel: "회전",
    brightnessLabel: "밝기",
    contrastLabel: "대비",
    saturationLabel: "채도",
    backgroundColorLabel: "배경색",
    export400Button: "400x400 PNG 내보내기",
    export800Button: "800x800 PNG 내보내기",
    metaNote: "현재 X 도움말 기준 권장 프로필 이미지는 <strong>400x400px</strong>, 지원 형식은 <strong>JPG/PNG/GIF</strong>, 최대 용량은 <strong>2MB</strong>입니다.",
    previewTitle: "플랫폼별 미리보기",
    previewCopy: "같은 편집 상태를 X, Discord, Instagram 느낌으로 번갈아 확인합니다.",
    previewNote: "실제 서비스 UI를 그대로 복제한 것은 아니고, 프로필 사진이 작게 보일 때의 인상을 빠르게 체크하기 위한 근사 프리뷰입니다.",
    platformX: "X",
    platformDiscord: "Discord",
    platformInstagram: "Instagram",
    xComposerTitle: "글쓰기",
    xComposerInput: "무슨 일이 일어나고 있나요?",
    xTimelineTitle: "타임라인",
    xTimelineMeta: "@yourhandle · 지금",
    xTimelineBody: "작은 아바타에서도 중심이 또렷하게 보이는지 확인해보세요.",
    xNotificationTitle: "알림",
    xNotificationBody: "<strong>someone</strong> 님이 회원님의 게시글을 마음에 들어 합니다.",
    xMicroTitle: "아주 작은 아이콘",
    xMicroBody: "실제 24px 아바타를 3배 확대해 보여줍니다.",
    xProfileTitle: "프로필 페이지",
    xProfileBody: "프로필 영역에서 얼굴이나 로고가 충분히 안정적으로 보이는지 체크합니다.",
    xTipsTitle: "체크 포인트",
    xTip1: "원형 가장자리에 중요한 요소가 닿지 않는지 보기",
    xTip2: "24px / 32px에서 눈, 글자, 로고가 뭉개지지 않는지 보기",
    xTip3: "밝은 배경과 어두운 배경 모두에서 분리감이 있는지 보기",
    xTip4: "투명 PNG라면 배경색을 바꿔가며 가장자리 품질 확인하기",
    discordSidebarTitle: "서버 멤버 목록",
    discordSidebarStatus: "온라인",
    discordChatTitle: "채팅 메시지",
    discordChatMeta: "오늘 8:24 PM",
    discordChatBody: "어두운 배경 위에서도 얼굴이나 로고가 또렷하게 보이는지 체크합니다.",
    discordPopoutTitle: "프로필 팝아웃",
    discordPopoutStatus: "Custom status goes here",
    discordTipsTitle: "Discord 체크 포인트",
    discordTip1: "짙은 배경에서 배경색이 아바타와 섞이지 않는지 보기",
    discordTip2: "32px 멤버 리스트에서 표정이나 심볼이 남는지 보기",
    discordTip3: "밝은 외곽선 없이도 모양이 분리되는지 보기",
    instagramStoryTitle: "스토리 링",
    instagramDmTitle: "DM 목록",
    instagramDmBody: "최근에 보낸 사진",
    instagramProfileTitle: "프로필 헤더",
    instagramStatPosts: "게시물",
    instagramStatFollowers: "팔로워",
    instagramStatFollowing: "팔로잉",
    instagramTipsTitle: "Instagram 체크 포인트",
    instagramTip1: "스토리 링 안쪽에서 여백이 너무 빡빡하지 않은지 보기",
    instagramTip2: "새하얀 배경에서도 외곽이 흐려지지 않는지 보기",
    instagramTip3: "DM 목록처럼 44px 전후 크기에서 인상이 남는지 보기",
    imageMetaEmpty: "아직 이미지를 불러오지 않았습니다.",
    imageMetaLoaded: ({ name, width, height, kb }) => `불러온 이미지: ${name} · ${width}x${height}px · ${kb}KB`,
  },
  ja: {
    documentTitle: "Xプロフィール画像プレビュー",
    htmlLang: "ja",
    languageLabel: "言語",
    heroTitle: "Xプロフィール画像プレビュー",
    heroCopy: "認証アカウントでプロフィール画像を変更する前に、小さな表示サイズまで先に確認して、そのまま書き出せるローカルWebアプリです。",
    editTitle: "編集",
    editCopy: "画像を読み込んで、ドラッグしながら位置を合わせてみてください。",
    loadImageLabel: "画像を読み込む",
    resetButton: "リセット",
    stageHelpOuter: "外側の円: 実際の円形トリミング",
    stageHelpInner: "内側の円: 小サイズ用の安全エリア",
    zoomLabel: "ズーム",
    offsetXLabel: "左右移動",
    offsetYLabel: "上下移動",
    rotationLabel: "回転",
    brightnessLabel: "明るさ",
    contrastLabel: "コントラスト",
    saturationLabel: "彩度",
    backgroundColorLabel: "背景色",
    export400Button: "400x400 PNGを書き出す",
    export800Button: "800x800 PNGを書き出す",
    metaNote: "現在のXヘルプ基準では、推奨プロフィール画像は<strong>400x400px</strong>、対応形式は<strong>JPG/PNG/GIF</strong>、最大容量は<strong>2MB</strong>です。",
    previewTitle: "プラットフォーム別プレビュー",
    previewCopy: "同じ編集状態をX、Discord、Instagram風に切り替えて確認できます。",
    previewNote: "実際のサービスUIを完全再現したものではなく、小さく表示されたときの印象を素早く確認するための近似プレビューです。",
    platformX: "X",
    platformDiscord: "Discord",
    platformInstagram: "Instagram",
    xComposerTitle: "投稿作成",
    xComposerInput: "いまどうしてる？",
    xTimelineTitle: "タイムライン",
    xTimelineMeta: "@yourhandle · 今",
    xTimelineBody: "小さなアバターでも中心がはっきり見えるか確認してみてください。",
    xNotificationTitle: "通知",
    xNotificationBody: "<strong>someone</strong> さんがあなたの投稿をいいねしました。",
    xMicroTitle: "極小アイコン",
    xMicroBody: "実際の24pxアバターを3倍に拡大して表示します。",
    xProfileTitle: "プロフィールページ",
    xProfileBody: "プロフィール領域で顔やロゴが十分に安定して見えるか確認します。",
    xTipsTitle: "チェックポイント",
    xTip1: "円の端に重要な要素が触れていないか見る",
    xTip2: "24px / 32pxで目や文字、ロゴが潰れていないか見る",
    xTip3: "明るい背景と暗い背景の両方で分離感があるか見る",
    xTip4: "透過PNGなら背景色を変えながら縁の品質を確認する",
    discordSidebarTitle: "サーバーメンバー一覧",
    discordSidebarStatus: "オンライン",
    discordChatTitle: "チャットメッセージ",
    discordChatMeta: "今日 8:24 PM",
    discordChatBody: "暗い背景の上でも顔やロゴがはっきり見えるか確認します。",
    discordPopoutTitle: "プロフィールポップアウト",
    discordPopoutStatus: "Custom status goes here",
    discordTipsTitle: "Discord チェックポイント",
    discordTip1: "濃い背景で背景色がアバターと混ざらないか見る",
    discordTip2: "32pxのメンバー一覧でも表情やシンボルが残るか見る",
    discordTip3: "明るい縁取りがなくても形が分離して見えるか見る",
    instagramStoryTitle: "ストーリーリング",
    instagramDmTitle: "DM一覧",
    instagramDmBody: "最近送った写真",
    instagramProfileTitle: "プロフィールヘッダー",
    instagramStatPosts: "投稿",
    instagramStatFollowers: "フォロワー",
    instagramStatFollowing: "フォロー中",
    instagramTipsTitle: "Instagram チェックポイント",
    instagramTip1: "ストーリーリングの内側で余白が詰まりすぎていないか見る",
    instagramTip2: "真っ白な背景でも輪郭がぼやけないか見る",
    instagramTip3: "DM一覧のような44px前後でも印象が残るか見る",
    imageMetaEmpty: "まだ画像を読み込んでいません。",
    imageMetaLoaded: ({ name, width, height, kb }) => `読み込んだ画像: ${name} · ${width}x${height}px · ${kb}KB`,
  },
  en: {
    documentTitle: "X Profile Photo Preview Tool",
    htmlLang: "en",
    languageLabel: "Language",
    heroTitle: "X Profile Photo Preview Tool",
    heroCopy: "A local web app that lets you test how your profile photo will look at small sizes before changing it on a verified account, then export it right away.",
    editTitle: "Edit",
    editCopy: "Load an image, then drag it into place.",
    loadImageLabel: "Load image",
    resetButton: "Reset",
    stageHelpOuter: "Outer circle: actual round crop",
    stageHelpInner: "Inner circle: safe area for small sizes",
    zoomLabel: "Zoom",
    offsetXLabel: "Move left/right",
    offsetYLabel: "Move up/down",
    rotationLabel: "Rotate",
    brightnessLabel: "Brightness",
    contrastLabel: "Contrast",
    saturationLabel: "Saturation",
    backgroundColorLabel: "Background color",
    export400Button: "Export 400x400 PNG",
    export800Button: "Export 800x800 PNG",
    metaNote: "Based on current X Help guidance, the recommended profile image is <strong>400x400px</strong>, supported formats are <strong>JPG/PNG/GIF</strong>, and the maximum file size is <strong>2MB</strong>.",
    previewTitle: "Platform Previews",
    previewCopy: "Switch between X, Discord, and Instagram style previews using the same edited image.",
    previewNote: "This is not a pixel-perfect copy of the real service UI. It is a fast approximation for checking how your avatar reads at small sizes.",
    platformX: "X",
    platformDiscord: "Discord",
    platformInstagram: "Instagram",
    xComposerTitle: "Composer",
    xComposerInput: "What is happening?!",
    xTimelineTitle: "Timeline",
    xTimelineMeta: "@yourhandle · now",
    xTimelineBody: "Check whether the focal point still reads clearly at small avatar sizes.",
    xNotificationTitle: "Notifications",
    xNotificationBody: "<strong>someone</strong> liked your post.",
    xMicroTitle: "Tiny icon",
    xMicroBody: "Shows a real 24px avatar enlarged 3x.",
    xProfileTitle: "Profile page",
    xProfileBody: "Check whether the face or logo still feels stable in the profile header.",
    xTipsTitle: "Things to check",
    xTip1: "Make sure important details do not touch the circular edge",
    xTip2: "See whether eyes, text, or logos break down at 24px / 32px",
    xTip3: "Check separation on both light and dark backgrounds",
    xTip4: "If using a transparent PNG, test edge quality against different background colors",
    discordSidebarTitle: "Server member list",
    discordSidebarStatus: "Online",
    discordChatTitle: "Chat message",
    discordChatMeta: "Today at 8:24 PM",
    discordChatBody: "Check whether the face or logo still reads clearly on a dark background.",
    discordPopoutTitle: "Profile popout",
    discordPopoutStatus: "Custom status goes here",
    discordTipsTitle: "Discord checklist",
    discordTip1: "Make sure the avatar does not blend into darker backgrounds",
    discordTip2: "Check whether expression or symbols survive at 32px in the member list",
    discordTip3: "See whether the shape still separates without a bright outline",
    instagramStoryTitle: "Story ring",
    instagramDmTitle: "DM list",
    instagramDmBody: "Sent a photo",
    instagramProfileTitle: "Profile header",
    instagramStatPosts: "Posts",
    instagramStatFollowers: "Followers",
    instagramStatFollowing: "Following",
    instagramTipsTitle: "Instagram checklist",
    instagramTip1: "Check that the story ring does not crowd the avatar too tightly",
    instagramTip2: "Make sure the outline stays clean even on a bright white background",
    instagramTip3: "See whether the image still leaves an impression around 44px in DM-style views",
    imageMetaEmpty: "No image loaded yet.",
    imageMetaLoaded: ({ name, width, height, kb }) => `Loaded image: ${name} · ${width}x${height}px · ${kb}KB`,
  },
};
const fileMeta = {
  name: "",
  width: 0,
  height: 0,
  kb: "0.0",
};

function bindControl(inputId, outputId, formatter) {
  return {
    input: document.querySelector(`#${inputId}`),
    output: document.querySelector(`#${outputId}`),
    formatter,
  };
}

function syncStateToControls() {
  Object.entries(controls).forEach(([key, control]) => {
    if (!control.input) {
      return;
    }

    control.input.value = state[key];

    if (control.output) {
      control.output.textContent = control.formatter
        ? control.formatter(control.input.value)
        : control.input.value;
    }
  });
}

function attachControlListeners() {
  Object.entries(controls).forEach(([key, control]) => {
    control.input.addEventListener("input", () => {
      state[key] = key === "backgroundColor" ? control.input.value : Number(control.input.value);

      if (control.output) {
        control.output.textContent = control.formatter
          ? control.formatter(control.input.value)
          : control.input.value;
      }

      markAvatarDirty();
      renderAll();
    });
  });
}

function markAvatarDirty() {
  avatarCacheDirty = true;
}

function detectInitialLanguage() {
  const savedLanguage = window.localStorage.getItem("x-avatar-lab-language");
  if (savedLanguage && translations[savedLanguage]) {
    return savedLanguage;
  }

  const browserLanguage = (navigator.language || "en").toLowerCase();
  if (browserLanguage.startsWith("ko")) {
    return "ko";
  }
  if (browserLanguage.startsWith("ja")) {
    return "ja";
  }
  return "en";
}

function setLocalizedImageMeta() {
  const locale = translations[state.language] || translations.ko;

  if (!state.image) {
    imageMeta.textContent = locale.imageMetaEmpty;
    return;
  }

  imageMeta.textContent = locale.imageMetaLoaded(fileMeta);
}

function applyLanguage(language) {
  const nextLanguage = translations[language] ? language : "ko";
  const locale = translations[nextLanguage];
  state.language = nextLanguage;
  document.documentElement.lang = locale.htmlLang;
  document.title = locale.documentTitle;
  languageSelect.value = nextLanguage;

  Object.entries(textTargets).forEach(([key, element]) => {
    if (!element || !(key in locale)) {
      return;
    }

    if (key === "metaNote" || key === "xNotificationBody") {
      element.innerHTML = locale[key];
      return;
    }

    element.textContent = locale[key];
  });

  if (platformTabLabels.x) {
    platformTabLabels.x.textContent = locale.platformX;
  }
  if (platformTabLabels.discord) {
    platformTabLabels.discord.textContent = locale.platformDiscord;
  }
  if (platformTabLabels.instagram) {
    platformTabLabels.instagram.textContent = locale.platformInstagram;
  }

  setLocalizedImageMeta();
  window.localStorage.setItem("x-avatar-lab-language", nextLanguage);
}

function setupScrollEffects() {
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const supportsObserver = "IntersectionObserver" in window;

  if (prefersReducedMotion || !supportsObserver) {
    revealTargets.forEach((element) => element.classList.add("is-visible"));
    return;
  }

  document.body.classList.add("motion-ready");

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) {
        return;
      }

      entry.target.classList.add("is-visible");
      observer.unobserve(entry.target);
    });
  }, {
    threshold: 0.14,
    rootMargin: "0px 0px -8% 0px",
  });

  revealTargets.forEach((element, index) => {
    element.style.transitionDelay = `${Math.min(index * 35, 180)}ms`;
    observer.observe(element);
  });
}

function applyDefaultState() {
  state.zoom = 1;
  state.offsetX = 0;
  state.offsetY = 0;
  state.rotation = 0;
  state.brightness = 100;
  state.contrast = 100;
  state.saturation = 100;
  state.backgroundColor = "#ffffff";
  syncStateToControls();
}

function setImageMeta(text) {
  imageMeta.textContent = text;
}

function setExportAvailability(enabled) {
  export400Button.disabled = !enabled;
  export800Button.disabled = !enabled;
}

function setActivePlatform(platform) {
  state.activePlatform = platform;

  platformTabs.forEach((button) => {
    const isActive = button.dataset.platformTab === platform;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-selected", String(isActive));
  });

  platformViews.forEach((view) => {
    view.classList.toggle("is-active", view.dataset.platformView === platform);
  });
}

function loadImage(file) {
  const reader = new FileReader();
  reader.onload = () => {
    const img = new Image();
    img.onload = () => {
      state.image = img;
      state.imageName = file.name.replace(/\.[^.]+$/, "") || "x-avatar";
      fileMeta.name = file.name;
      fileMeta.width = img.width;
      fileMeta.height = img.height;
      fileMeta.kb = (file.size / 1024).toFixed(1);
      applyDefaultState();
      setExportAvailability(true);
      markAvatarDirty();
      setLocalizedImageMeta();
      renderAll();
    };
    img.src = reader.result;
  };
  reader.readAsDataURL(file);
}

function paintAvatar(ctx, size) {
  ctx.clearRect(0, 0, size, size);
  ctx.save();
  ctx.beginPath();
  ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
  ctx.clip();

  ctx.fillStyle = state.backgroundColor;
  ctx.fillRect(0, 0, size, size);

  if (state.image) {
    const baseScale = Math.max(size / state.image.width, size / state.image.height);
    const drawScale = baseScale * state.zoom;
    const drawWidth = state.image.width * drawScale;
    const drawHeight = state.image.height * drawScale;
    const offsetScale = size / 520;

    ctx.save();
    ctx.translate(size / 2 + state.offsetX * offsetScale, size / 2 + state.offsetY * offsetScale);
    ctx.rotate((state.rotation * Math.PI) / 180);
    ctx.filter = `brightness(${state.brightness}%) contrast(${state.contrast}%) saturate(${state.saturation}%)`;
    ctx.drawImage(state.image, -drawWidth / 2, -drawHeight / 2, drawWidth, drawHeight);
    ctx.restore();
  } else {
    drawPlaceholder(ctx, size);
  }

  ctx.restore();
}

function rebuildAvatarCache() {
  paintAvatar(avatarCacheCtx, avatarCacheCanvas.width);
  avatarCacheDirty = false;
}

function drawAvatar(ctx, size, opts = {}) {
  const {
    addFrame = false,
    showGrid = false,
  } = opts;

  ctx.clearRect(0, 0, size, size);

  if (showGrid) {
    drawEditorBackground(ctx, size);
  }

  if (avatarCacheDirty) {
    rebuildAvatarCache();
  }

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(avatarCacheCanvas, 0, 0, size, size);

  if (addFrame) {
    ctx.save();
    ctx.beginPath();
    ctx.arc(size / 2, size / 2, size / 2 - 1.5, 0, Math.PI * 2);
    ctx.strokeStyle = "rgba(255,255,255,0.95)";
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.restore();
  }
}

function drawEditorBackground(ctx, size) {
  ctx.save();
  ctx.fillStyle = "#efe9de";
  ctx.fillRect(0, 0, size, size);

  const cell = 32;
  for (let y = 0; y < size; y += cell) {
    for (let x = 0; x < size; x += cell) {
      if ((x / cell + y / cell) % 2 === 0) {
        ctx.fillStyle = "#e3dacb";
        ctx.fillRect(x, y, cell, cell);
      }
    }
  }
  ctx.restore();
}

function drawPlaceholder(ctx, size) {
  const gradient = ctx.createLinearGradient(0, 0, size, size);
  gradient.addColorStop(0, "#1d9bf0");
  gradient.addColorStop(1, "#12395d");

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);

  ctx.fillStyle = "rgba(255,255,255,0.18)";
  ctx.beginPath();
  ctx.arc(size * 0.5, size * 0.36, size * 0.18, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(size * 0.5, size * 0.82, size * 0.34, Math.PI, 0);
  ctx.fill();
}

function drawEditorOverlay() {
  const size = editorCanvas.width;
  const outerRadius = size / 2 - 16;
  const innerRadius = outerRadius * 0.78;

  editorCtx.save();
  editorCtx.fillStyle = "rgba(10, 14, 18, 0.32)";
  editorCtx.beginPath();
  editorCtx.rect(0, 0, size, size);
  editorCtx.arc(size / 2, size / 2, outerRadius, 0, Math.PI * 2, true);
  editorCtx.fill("evenodd");

  editorCtx.strokeStyle = "rgba(255,255,255,0.95)";
  editorCtx.lineWidth = 2;
  editorCtx.beginPath();
  editorCtx.arc(size / 2, size / 2, outerRadius, 0, Math.PI * 2);
  editorCtx.stroke();

  editorCtx.setLineDash([10, 8]);
  editorCtx.strokeStyle = "rgba(255, 210, 126, 0.95)";
  editorCtx.beginPath();
  editorCtx.arc(size / 2, size / 2, innerRadius, 0, Math.PI * 2);
  editorCtx.stroke();
  editorCtx.setLineDash([]);

  editorCtx.strokeStyle = "rgba(255,255,255,0.22)";
  editorCtx.beginPath();
  editorCtx.moveTo(size / 2, 16);
  editorCtx.lineTo(size / 2, size - 16);
  editorCtx.moveTo(16, size / 2);
  editorCtx.lineTo(size - 16, size / 2);
  editorCtx.stroke();
  editorCtx.restore();
}

function renderAllNow() {
  drawAvatar(editorCtx, editorCanvas.width, { showGrid: true });
  drawEditorOverlay();

  previewCanvases.forEach(({ canvas, size, addFrame }) => {
    const ctx = canvas.getContext("2d");
    drawAvatar(ctx, size, { addFrame });
  });
}

function renderAll() {
  if (renderQueued) {
    return;
  }

  renderQueued = true;
  window.requestAnimationFrame(() => {
    renderQueued = false;
    renderAllNow();
  });
}

function exportAvatar(size) {
  if (!state.image) {
    return;
  }

  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  paintAvatar(ctx, size);

  canvas.toBlob((blob) => {
    if (!blob) {
      return;
    }

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${state.imageName || "x-avatar"}-${size}.png`;
    link.click();
    URL.revokeObjectURL(url);
  }, "image/png");
}

function updateOffsetsFromDrag(clientX, clientY) {
  const rect = editorCanvas.getBoundingClientRect();
  const scaleX = editorCanvas.width / rect.width;
  const scaleY = editorCanvas.height / rect.height;
  state.offsetX = Math.max(-220, Math.min(220, state.dragOriginX + (clientX - state.dragStartX) * scaleX));
  state.offsetY = Math.max(-220, Math.min(220, state.dragOriginY + (clientY - state.dragStartY) * scaleY));
  syncStateToControls();
  markAvatarDirty();
  renderAll();
}

imageInput.addEventListener("change", (event) => {
  const [file] = event.target.files || [];
  if (!file) {
    return;
  }
  loadImage(file);
});

languageSelect.addEventListener("change", () => {
  applyLanguage(languageSelect.value);
});

resetButton.addEventListener("click", () => {
  applyDefaultState();
  markAvatarDirty();
  renderAll();
});

export400Button.addEventListener("click", () => exportAvatar(400));
export800Button.addEventListener("click", () => exportAvatar(800));
platformTabs.forEach((button) => {
  button.addEventListener("click", () => {
    setActivePlatform(button.dataset.platformTab);
  });
});

editorCanvas.addEventListener("pointerdown", (event) => {
  state.dragging = true;
  state.dragStartX = event.clientX;
  state.dragStartY = event.clientY;
  state.dragOriginX = state.offsetX;
  state.dragOriginY = state.offsetY;
  editorCanvas.classList.add("dragging");
  editorCanvas.setPointerCapture(event.pointerId);
});

editorCanvas.addEventListener("pointermove", (event) => {
  if (!state.dragging) {
    return;
  }
  updateOffsetsFromDrag(event.clientX, event.clientY);
});

editorCanvas.addEventListener("wheel", (event) => {
  event.preventDefault();
  const nextZoom = state.zoom + (event.deltaY < 0 ? 0.06 : -0.06);
  state.zoom = Math.min(3, Math.max(0.6, Number(nextZoom.toFixed(2))));
  syncStateToControls();
  markAvatarDirty();
  renderAll();
}, { passive: false });

function stopDragging(event) {
  if (!state.dragging) {
    return;
  }
  state.dragging = false;
  editorCanvas.classList.remove("dragging");
  if (event) {
    editorCanvas.releasePointerCapture(event.pointerId);
  }
}

editorCanvas.addEventListener("pointerup", stopDragging);
editorCanvas.addEventListener("pointercancel", stopDragging);
editorCanvas.addEventListener("pointerleave", () => {
  if (!state.dragging) {
    return;
  }
  renderAll();
});

attachControlListeners();
applyDefaultState();
applyLanguage(detectInitialLanguage());
setActivePlatform("x");
setExportAvailability(false);
setupScrollEffects();
renderAll();
