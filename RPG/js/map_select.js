// js/map_select.js

document.addEventListener('DOMContentLoaded', () => {
    // --- 1. DOM Element Variables ---
    const selectedCharNameMap = document.getElementById('selected-char-name-map');
    const selectedCharImgMap = document.getElementById('selected-char-img-map');
    const mapMeatJerkyDisplay = document.getElementById('map-meat-jerky-display'); // 用於顯示肉乾數量

    const locationButtons = document.querySelectorAll('.map-location-btn');

    const modal = document.getElementById('location-details-modal');
    const modalLocationName = document.getElementById('modal-location-name');
    const modalLocationIntro = document.getElementById('modal-location-intro');
    const modalLocationImage = document.getElementById('modal-location-image'); // 如果你決定使用地點圖片
    const confirmEnterBtnInModal = document.getElementById('confirm-enter-location-btn');
    const closeModalBtn = document.querySelector('.close-modal-btn');
    const cancelModalBtn = document.getElementById('cancel-modal-btn');

    const resetGameBtnMap = document.getElementById('reset-game-btn-map');

    // 狀態變量
    let currentTargetPage = null;
    let currentActionType = null;
    let currentSelectedLocationFullName = null;
    let characterData = null;

    // --- 2. 從 localStorage 獲取角色資訊 ---
    const characterDataString = localStorage.getItem('selectedCharacter');
    if (characterDataString) {
        characterData = JSON.parse(characterDataString);
        if (selectedCharNameMap) selectedCharNameMap.textContent = characterData.name; // 添加判空
        if (selectedCharImgMap) { // 添加判空
            if (characterData.img) {
                selectedCharImgMap.src = characterData.img;
                selectedCharImgMap.alt = characterData.name;
                selectedCharImgMap.classList.remove('hidden');
            } else {
                selectedCharImgMap.classList.add('hidden');
            }
        }
    } else {
        alert('未選擇角色，將返回角色選擇頁面。');
        window.location.href = 'index.html';
        return;
    }

    // --- 新增：獲取並顯示肉乾數量 ---
    if (mapMeatJerkyDisplay) { // 添加判空
        const currentMeatJerky = parseInt(localStorage.getItem('meatJerkyCount')) || 0;
        mapMeatJerkyDisplay.textContent = currentMeatJerky;
    }

    // --- 3. 重置遊戲邏輯 ---
    if (resetGameBtnMap) {
        resetGameBtnMap.addEventListener('click', () => {
            if (confirm("確定要重新開始嗎？\n所有的進度、肉乾和地點解鎖都會被清除並返回首頁。")) {
                localStorage.removeItem('meatJerkyCount');
                localStorage.removeItem('basementUnlocked');
                localStorage.removeItem('selectedCharacter');
                localStorage.removeItem('answersHistory');
                alert("遊戲進度已重置！");
                window.location.href = 'index.html';
            }
        });
    }

    // --- 4. 地點按鈕事件監聽 ---
    if (locationButtons && locationButtons.length > 0) { // 添加判空
        locationButtons.forEach(button => {
            // 更新地下室鎖定狀態
            if (button.id === 'loc-basement') {
                const isBasementUnlocked = localStorage.getItem('basementUnlocked') === 'true';
                if (!isBasementUnlocked) {
                    button.dataset.locked = "true";
                    button.title = "目前無法進入 - 需要收集3個肉乾";
                    button.disabled = true;
                } else {
                    delete button.dataset.locked;
                    button.title = "進入地下室";
                    button.disabled = false;
                    button.classList.add('unlocked-location');
                }
            }

            button.addEventListener('click', () => {
                if (button.dataset.locked === "true" || button.disabled) {
                    alert(button.title || "此地點目前無法進入。");
                    return;
                }

                locationButtons.forEach(btn => btn.classList.remove('selected-location'));
                button.classList.add('selected-location');

                const locationName = button.dataset.locationName;
                const locationIntro = button.dataset.locationIntro;
                const targetPage = button.dataset.targetPage;
                const actionType = button.dataset.actionType || "quiz";

                if (modalLocationName) modalLocationName.textContent = locationName; // 添加判空
                if (modalLocationIntro) modalLocationIntro.innerHTML = locationIntro.replace(/\n/g, '<br>'); // 添加判空

                // 可選：設置地點圖片
                // if (modalLocationImage) {
                //     const locationImgSrc = `images/locations/${button.id}.png`; 
                //     modalLocationImage.src = locationImgSrc;
                //     modalLocationImage.classList.remove('hidden');
                // }

                currentTargetPage = targetPage;
                currentActionType = actionType;
                currentSelectedLocationFullName = locationName;

                if (confirmEnterBtnInModal) { // 添加判空
                    if (actionType === "navigate" && targetPage === "index.html") {
                        confirmEnterBtnInModal.textContent = "返回首頁";
                    } else {
                        confirmEnterBtnInModal.textContent = "確定進入";
                    }
                }

                if (modal) modal.classList.remove('hidden'); // 添加判空
            });
        });
    }


    // --- 5. 模態框關閉邏輯 ---
    function closeModal() {
        if (modal) modal.classList.add('hidden'); // 添加判空
        currentTargetPage = null;
        currentActionType = null;
        currentSelectedLocationFullName = null;
        if (modalLocationImage) modalLocationImage.classList.add('hidden');
        if (locationButtons) locationButtons.forEach(btn => btn.classList.remove('selected-location')); // 添加判空
    }

    if (closeModalBtn) closeModalBtn.addEventListener('click', closeModal); // 添加判空
    if (cancelModalBtn) cancelModalBtn.addEventListener('click', closeModal); // 添加判空

    window.addEventListener('click', (event) => {
        if (modal && event.target == modal) { // 添加判空
            closeModal();
        }
    });

    // --- 6. 模態框 "確定進入" 按鈕邏輯 ---
    if (confirmEnterBtnInModal) { // 添加判空
        confirmEnterBtnInModal.addEventListener('click', () => {
            if (!currentTargetPage || !characterData) {
                alert('發生錯誤，無法確定目標地點或角色資訊。');
                closeModal();
                return;
            }

            if (currentActionType === "navigate") {
                window.location.href = currentTargetPage;
            } else if (currentActionType === "quiz") {
                const params = new URLSearchParams();
                params.append('char', characterData.id);

                let cleanLocationName = currentSelectedLocationFullName;
                if (currentSelectedLocationFullName) { // 添加判空
                    const firstSpaceIndex = currentSelectedLocationFullName.indexOf(" ");
                    if (firstSpaceIndex !== -1 && firstSpaceIndex < 3) {
                        cleanLocationName = currentSelectedLocationFullName.substring(firstSpaceIndex + 1).trim();
                    }
                }
                params.append('location', cleanLocationName);
                const separator = currentTargetPage.includes('?') ? '&' : '?';
                window.location.href = `${currentTargetPage}${separator}${params.toString()}`;
            }
            // closeModal(); // 跳轉時可以省略
        });
    }

    // 示例：解鎖地下室的函數 (你可以根據遊戲進程在其他地方調用)
    // function unlockBasement() {
    //     localStorage.setItem('basementUnlocked', 'true');
    //     const basementButton = document.getElementById('loc-basement');
    //     if (basementButton) {
    //         delete basementButton.dataset.locked;
    //         basementButton.title = "進入地下室";
    //         basementButton.disabled = false;
    //         basementButton.classList.add('unlocked-location');
    //     }
    // }
    // // 測試用: 可以在控制台調用 unlockBasement() 來手動解鎖
});