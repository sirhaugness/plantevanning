document.addEventListener('DOMContentLoaded', () => {
    const waterButton = document.getElementById('waterButton');
    const lastWateredText = document.getElementById('lastWatered');
    const timeSinceText = document.getElementById('timeSince');
    const wateringHistory = document.getElementById('wateringHistory');
    const statusIcon = document.getElementById('statusIcon');

    // Hent vanningshistorikk fra localStorage
    let wateringLogs = JSON.parse(localStorage.getItem('wateringLogs') || '[]');
    let lastWatered = localStorage.getItem('lastWatered');

    const måneder = {
        0: 'jan',
        1: 'feb',
        2: 'mar',
        3: 'apr',
        4: 'mai',
        5: 'jun',
        6: 'jul',
        7: 'aug',
        8: 'sep',
        9: 'okt',
        10: 'nov',
        11: 'des'
    };

    function formaterDato(dato) {
        const d = new Date(dato);
        const dag = d.getDate();
        const mnd = måneder[d.getMonth()];
        const år = d.getFullYear();
        const time = d.getHours().toString().padStart(2, '0');
        const min = d.getMinutes().toString().padStart(2, '0');
        
        return `${dag}. ${mnd} ${år} kl. ${time}:${min}`;
    }

    function formatTimeSince(timestamp) {
        const timeSince = new Date().getTime() - timestamp;
        const hours = Math.floor(timeSince / (1000 * 60 * 60));
        const minutes = Math.floor((timeSince % (1000 * 60 * 60)) / (1000 * 60));
        return `${hours} timer og ${minutes} minutter`;
    }

    function sjekkVanningStatus(timestamp) {
        const seksDager = 6 * 24 * 60 * 60 * 1000;
        const syuDager = 7 * 24 * 60 * 60 * 1000;
        const tidSidenVanning = new Date().getTime() - timestamp;
        
        if (tidSidenVanning < seksDager) {
            return 'bra';
        } else if (tidSidenVanning >= syuDager) {
            return 'dårlig';
        }
        return 'nøytral';
    }

    function updateWateringInfo() {
        if (lastWatered) {
            const date = new Date(parseInt(lastWatered));
            lastWateredText.textContent = `Sist vannet: ${formaterDato(date)}`;
            timeSinceText.textContent = `Tid siden sist vanning: ${formatTimeSince(parseInt(lastWatered))}`;
            
            // Oppdater status-ikon
            const status = sjekkVanningStatus(parseInt(lastWatered));
            statusIcon.classList.add('visible');
            
            switch (status) {
                case 'bra':
                    statusIcon.innerHTML = '👍';
                    break;
                case 'dårlig':
                    statusIcon.innerHTML = '👎';
                    statusIcon.style.color = '#ff4444';
                    break;
                default:
                    statusIcon.innerHTML = '';
                    statusIcon.classList.remove('visible');
            }
        }
    }

    function updateWateringLog() {
        wateringHistory.innerHTML = '';
        const recentLogs = wateringLogs.slice(-5).reverse(); // Vis bare de 5 siste vanningene

        recentLogs.forEach((log, index) => {
            const li = document.createElement('li');
            const timeSincePrev = index < recentLogs.length - 1 
                ? `(${formatTimeSince(recentLogs[index + 1].timestamp)} siden forrige vanning)`
                : '';
            
            li.textContent = `${formaterDato(log.timestamp)} ${timeSincePrev}`;
            wateringHistory.appendChild(li);
        });
    }

    // Oppdater informasjon hvert minutt
    setInterval(() => {
        updateWateringInfo();
        updateWateringLog();
    }, 60000);

    // Oppdater når siden lastes
    if (lastWatered) {
        updateWateringInfo();
        updateWateringLog();
    }

    waterButton.addEventListener('click', () => {
        const timestamp = new Date().getTime();
        lastWatered = timestamp;
        wateringLogs.push({ timestamp });
        
        // Lagre data
        localStorage.setItem('lastWatered', lastWatered);
        localStorage.setItem('wateringLogs', JSON.stringify(wateringLogs));
        
        // Oppdater visning
        updateWateringInfo();
        updateWateringLog();
    });
}); 