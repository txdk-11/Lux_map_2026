// 측정 데이터 (위치명, 위도, 경도, 조도값)
const measurementData = [
    {
        name: '동진신안',
        lat: 37.6540,
        lng: 127.0577,
        lux: 2,
        address: '서울시 노원구 중계동'
    },
    {
        name: '중계1동어린이집',
        lat: 37.6535,
        lng: 127.0585,
        lux: 3,
        address: '서울시 노원구 중계동'
    },
    {
        name: '델리치즈밥',
        lat: 37.6525,
        lng: 127.0595,
        lux: 7,
        address: '서울시 노원구 중계동'
    },
    {
        name: '메가MGC커피 중계학원가점',
        lat: 37.6520,
        lng: 127.0605,
        lux: 17,
        address: '서울시 노원구 중계동'
    },
    {
        name: '을지초등학교',
        lat: 37.6515,
        lng: 127.0570,
        lux: 3,
        address: '서울시 노원구 중계동'
    },
    {
        name: '중계청구3차아파트',
        lat: 37.6530,
        lng: 127.0575,
        lux: 4,
        address: '서울시 노원구 중계동'
    }
];

let map;
let markers = [];
let infoWindows = [];

// 위험도 판정 함수
function getSafetyStatus(lux) {
    if (lux <= 10) return { status: '위험', color: '#d32f2f', class: 'danger' };
    if (lux <= 30) return { status: '주의', color: '#f57c00', class: 'warning' };
    return { status: '안전', color: '#388e3c', class: 'safe' };
}

// Google Map 초기화
function initMap() {
    // 노원구 중계동 중심 좌표
    const centerPoint = { lat: 37.6525, lng: 127.0585 };

    map = new google.maps.Map(document.getElementById('map'), {
        zoom: 16,
        center: centerPoint,
        mapTypeControl: true,
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        fullscreenControl: true,
        zoomControl: true,
        streetViewControl: true,
        styles: [
            {
                featureType: 'all',
                elementType: 'labels.text.fill',
                stylers: [{ color: '#333333' }]
            }
        ]
    });

    // 마커 생성
    measurementData.forEach((location, index) => {
        createMarker(location, index);
    });

    // 통계 업데이트
    updateStatistics();

    // 위치 목록 생성
    createLocationsList();
}

// 마커 생성 함수
function createMarker(location, index) {
    const safety = getSafetyStatus(location.lux);

    // 커스텀 마커 아이콘
    const markerIcon = {
        path: google.maps.SymbolPath.CIRCLE,
        scale: 12,
        fillColor: safety.color,
        fillOpacity: 0.9,
        strokeColor: '#fff',
        strokeWeight: 2
    };

    const marker = new google.maps.Marker({
        position: { lat: location.lat, lng: location.lng },
        map: map,
        title: location.name,
        icon: markerIcon,
        animation: google.maps.Animation.DROP
    });

    // 인포윈도우 생성
    const infoWindowContent = `
        <div class="popup-content">
            <div class="popup-location-name">${location.name}</div>
            <div class="popup-lux-value">조도: <strong>${location.lux} lx</strong></div>
            <div class="popup-status ${safety.class}">${safety.status}</div>
            <div style="margin-top: 8px; font-size: 0.85em; color: #666;">
                ${location.address}
            </div>
        </div>
    `;

    const infoWindow = new google.maps.InfoWindow({
        content: infoWindowContent,
        maxWidth: 250
    });

    marker.addListener('click', () => {
        // 열려있는 모든 인포윈도우 닫기
        infoWindows.forEach(iw => iw.close());
        infoWindow.open(map, marker);
    });

    markers.push(marker);
    infoWindows.push(infoWindow);
}

// 통계 업데이트
function updateStatistics() {
    let dangerCount = 0;
    let warningCount = 0;
    let safeCount = 0;

    measurementData.forEach(location => {
        const safety = getSafetyStatus(location.lux);
        if (safety.status === '위험') dangerCount++;
        else if (safety.status === '주의') warningCount++;
        else safeCount++;
    });

    document.getElementById('dangerCount').textContent = dangerCount;
    document.getElementById('warningCount').textContent = warningCount;
    document.getElementById('safeCount').textContent = safeCount;
}

// 위치 목록 생성
function createLocationsList() {
    const listContainer = document.getElementById('locationsList');
    listContainer.innerHTML = '';

    // 조도 기준으로 정렬 (낮은 순서)
    const sortedData = [...measurementData].sort((a, b) => a.lux - b.lux);

    sortedData.forEach((location, index) => {
        const safety = getSafetyStatus(location.lux);
        
        const locationItem = document.createElement('div');
        locationItem.className = `location-item ${safety.class}`;
        locationItem.innerHTML = `
            <div class="location-name">${location.name}</div>
            <div class="location-lux">${location.lux} lx - ${safety.status}</div>
        `;

        // 클릭 시 해당 마커로 이동 및 정보 표시
        locationItem.addEventListener('click', () => {
            const marker = markers[measurementData.indexOf(location)];
            map.setCenter(marker.getPosition());
            map.setZoom(17);
            marker.setAnimation(google.maps.Animation.BOUNCE);
            setTimeout(() => marker.setAnimation(null), 700);
            infoWindows[measurementData.indexOf(location)].open(map, marker);
        });

        listContainer.appendChild(locationItem);
    });
}

// 페이지 로드 완료 후 지도 초기화
document.addEventListener('DOMContentLoaded', () => {
    initMap();
});

// 구글 지도 로드 실패 시 에러 처리
window.gm_authFailure = function() {
    console.error('Google Maps API 인증에 실패했습니다. API 키를 확인해주세요.');
    const mapContainer = document.getElementById('map');
    mapContainer.innerHTML = '<div style="padding: 20px; color: red;">지도를 불러올 수 없습니다. API 키 설정을 확인해주세요.</div>';
};
