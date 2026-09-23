/**
 * Credify Zero-Trust Embedded Verification Widget SDK (v1.0.0)
 * Drop-in verification interface for any external university or company website.
 */
(function (window, document) {
  'use strict';

  function initCredifyWidget() {
    const containers = document.querySelectorAll('[data-credify-widget], #credify-verify-widget');
    if (!containers.length) return;

    // Clean SVGs for widget
    const svgGraduationCap = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>`;
    const svgFileText = `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#716049" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><line x1="16" x2="8" y1="13" y2="13"/><line x1="16" x2="8" y1="17" y2="17"/><line x1="10" x2="8" y1="9" y2="9"/></svg>`;
    const svgShield = `<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/></svg>`;
    const svgCheck = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#15803D" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>`;
    const svgAlert = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#DC2626" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" x2="12" y1="9" y2="13"/><line x1="12" x2="12.01" y1="17" y2="17"/></svg>`;
    const svgXCircle = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#991B1B" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" x2="9" y1="9" y2="15"/><line x1="9" x2="15" y1="9" y2="15"/></svg>`;

    containers.forEach((container) => {
      const apiKey = container.getAttribute('data-api-key') || '';
      const collegeName = container.getAttribute('data-college-name') || 'Official Examination Cell';
      const endpoint = container.getAttribute('data-endpoint') || 'http://localhost:3000/api/v1/verify';
      const themeColor = container.getAttribute('data-theme-color') || '#181A1D';

      container.innerHTML = `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 580px; margin: 0 auto; background: #ffffff; border: 1px solid #EAE0CE; border-radius: 20px; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05); overflow: hidden; color: #141619;">
          <!-- Widget Header -->
          <div style="background: ${themeColor}; color: #ffffff; padding: 18px 24px; display: flex; align-items: center; justify-content: space-between;">
            <div style="display: flex; align-items: center; gap: 12px;">
              <div style="width: 34px; height: 34px; border-radius: 10px; background: rgba(255,255,255,0.15); display: flex; align-items: center; justify-content: center;">
                ${svgGraduationCap}
              </div>
              <div>
                <h4 style="margin: 0; font-size: 14px; font-weight: 700; letter-spacing: -0.2px;">${collegeName}</h4>
                <p style="margin: 2px 0 0 0; font-size: 11px; opacity: 0.8; font-family: monospace;">E-Verification & PKI Registry</p>
              </div>
            </div>
            <span style="background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2); font-size: 10px; padding: 4px 10px; border-radius: 20px; font-weight: 600; display: inline-flex; align-items: center; gap: 4px;">
              ${svgShield}
              <span>Zero-Trust</span>
            </span>
          </div>

          <!-- Body Controls -->
          <div style="padding: 24px;">
            <p style="margin: 0 0 16px 0; font-size: 13px; color: #716049; line-height: 1.5;">
              Verify official marksheets, degrees, internships, and hackathon certificates issued with cryptographic integrity.
            </p>

            <!-- Mode Switcher -->
            <div style="display: flex; background: #FAF6EF; border: 1px solid #EAE0CE; border-radius: 12px; padding: 3px; gap: 4px; margin-bottom: 18px;">
              <button id="crdf-tab-file" style="flex: 1; padding: 8px; border: none; background: #ffffff; border-radius: 9px; font-size: 12px; font-weight: 700; color: #141619; cursor: pointer; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">Upload PDF</button>
              <button id="crdf-tab-id" style="flex: 1; padding: 8px; border: none; background: transparent; border-radius: 9px; font-size: 12px; font-weight: 600; color: #716049; cursor: pointer;">Enter Certificate ID</button>
            </div>

            <!-- Upload PDF Section -->
            <div id="crdf-sec-file" style="display: block;">
              <div id="crdf-dropzone" style="border: 2px dashed #D5C5AC; background: #FAF6EF; border-radius: 14px; padding: 28px 16px; text-align: center; cursor: pointer; transition: all 0.2s ease;">
                <div style="display: flex; justify-content: center; margin-bottom: 8px;">
                  ${svgFileText}
                </div>
                <div style="font-size: 13px; font-weight: 700; color: #141619;" id="crdf-file-label">Click or Drop Credential PDF here</div>
                <div style="font-size: 11px; color: #948065; margin-top: 4px;">Supports Marksheets, Internships, Hackathons & Degrees (Max 10MB)</div>
                <input type="file" id="crdf-file-input" accept="application/pdf,.pdf" style="display: none;" />
              </div>
            </div>

            <!-- ID Input Section -->
            <div id="crdf-sec-id" style="display: none;">
              <div style="display: flex; gap: 8px;">
                <input type="text" id="crdf-id-input" placeholder="e.g. fac22f5f-0170-460a-881d-..." style="flex: 1; padding: 12px 14px; border: 1px solid #EAE0CE; border-radius: 12px; font-size: 13px; font-family: monospace; outline: none;" />
                <button id="crdf-id-btn" style="background: ${themeColor}; color: #ffffff; border: none; padding: 0 18px; border-radius: 12px; font-size: 12px; font-weight: 700; cursor: pointer;">Verify</button>
              </div>
            </div>

            <!-- Loading Spinner -->
            <div id="crdf-loading" style="display: none; padding: 24px 0; text-align: center;">
              <div style="display: inline-block; width: 28px; height: 28px; border: 3px solid #FAF6EF; border-top: 3px solid ${themeColor}; border-radius: 50%; animation: crdf-spin 0.8s linear infinite;"></div>
              <p style="margin: 8px 0 0 0; font-size: 12px; color: #716049; font-weight: 600;">Executing Cryptographic Signature Validation...</p>
            </div>

            <!-- Verification Result Container -->
            <div id="crdf-result" style="display: none; margin-top: 20px;"></div>
          </div>

          <!-- Footer -->
          <div style="background: #FAF6EF; border-top: 1px solid #EAE0CE; padding: 12px 24px; display: flex; align-items: center; justify-content: space-between; font-size: 11px; color: #716049;">
            <span style="display: inline-flex; align-items: center; gap: 4px;">${svgShield} End-to-End PKI Cryptography</span>
            <span>Powered by <strong style="color: #141619;">Credify Engine</strong></span>
          </div>
        </div>
        <style>
          @keyframes crdf-spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        </style>
      `;

      // Event Listeners
      const tabFile = container.querySelector('#crdf-tab-file');
      const tabId = container.querySelector('#crdf-tab-id');
      const secFile = container.querySelector('#crdf-sec-file');
      const secId = container.querySelector('#crdf-sec-id');
      const dropzone = container.querySelector('#crdf-dropzone');
      const fileInput = container.querySelector('#crdf-file-input');
      const fileLabel = container.querySelector('#crdf-file-label');
      const idInput = container.querySelector('#crdf-id-input');
      const idBtn = container.querySelector('#crdf-id-btn');
      const loading = container.querySelector('#crdf-loading');
      const resultBox = container.querySelector('#crdf-result');

      function switchTab(activeTab) {
        if (activeTab === 'file') {
          tabFile.style.background = '#ffffff';
          tabFile.style.color = '#141619';
          tabFile.style.fontWeight = '700';
          tabId.style.background = 'transparent';
          tabId.style.color = '#716049';
          tabId.style.fontWeight = '600';
          secFile.style.display = 'block';
          secId.style.display = 'none';
        } else {
          tabId.style.background = '#ffffff';
          tabId.style.color = '#141619';
          tabId.style.fontWeight = '700';
          tabFile.style.background = 'transparent';
          tabFile.style.color = '#716049';
          tabFile.style.fontWeight = '600';
          secId.style.display = 'block';
          secFile.style.display = 'none';
        }
      }

      tabFile.addEventListener('click', () => switchTab('file'));
      tabId.addEventListener('click', () => switchTab('id'));

      dropzone.addEventListener('click', () => fileInput.click());
      fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
          fileLabel.innerText = file.name;
          verifyFile(file);
        }
      });

      idBtn.addEventListener('click', () => {
        const val = idInput.value.trim();
        if (val) verifyId(val);
      });

      async function verifyFile(file) {
        loading.style.display = 'block';
        resultBox.style.display = 'none';
        try {
          const fd = new FormData();
          fd.append('file', file);
          const res = await fetch(endpoint, {
            method: 'POST',
            headers: { 'x-api-key': apiKey },
            body: fd,
          });
          const data = await res.json();
          renderResult(data);
        } catch (err) {
          renderError(err.message || 'Verification failed');
        } finally {
          loading.style.display = 'none';
        }
      }

      async function verifyId(certId) {
        loading.style.display = 'block';
        resultBox.style.display = 'none';
        try {
          const res = await fetch(endpoint, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-api-key': apiKey,
            },
            body: JSON.stringify({ id: certId }),
          });
          const data = await res.json();
          renderResult(data);
        } catch (err) {
          renderError(err.message || 'Verification failed');
        } finally {
          loading.style.display = 'none';
        }
      }

      function renderResult(data) {
        resultBox.style.display = 'block';
        if (!data.success || data.result === 'not_found') {
          resultBox.innerHTML = `
            <div style="background: #FEF2F2; border: 1px solid #FECACA; border-radius: 14px; padding: 16px; color: #991B1B;">
              <div style="display: flex; align-items: center; gap: 8px; font-weight: bold; font-size: 13px;">
                ${svgXCircle} <span>Credential Not Found in Registry</span>
              </div>
              <p style="margin: 6px 0 0 0; font-size: 11px; opacity: 0.9;">No cryptographic record exists matching this document under ${collegeName}.</p>
            </div>
          `;
          return;
        }

        if (data.result === 'tampered') {
          resultBox.innerHTML = `
            <div style="background: #FEF2F2; border: 1px solid #F87171; border-radius: 14px; padding: 18px; color: #991B1B;">
              <div style="display: flex; align-items: center; gap: 8px; font-weight: 800; font-size: 13px;">
                ${svgAlert} <span>DOCUMENT TAMPERING DETECTED</span>
              </div>
              <p style="margin: 6px 0 10px 0; font-size: 12px; line-height: 1.4;">
                The mathematical signature does not match the content of this document. Critical fields appear to have been altered post-issuance.
              </p>
              <div style="background: rgba(255,255,255,0.7); border-radius: 8px; padding: 8px 12px; font-size: 11px; font-family: monospace;">
                Status: INVALID_CRYPTOGRAPHIC_SIGNATURE
              </div>
            </div>
          `;
          return;
        }

        if (data.result === 'authentic') {
          const c = data.certificate || {};
          const candidateName = c.studentName || c.recipientName || 'Candidate';
          const credTitle = c.degree || c.role || c.event || c.title || 'Official Credential';
          const identifier = c.rollNo || c.id || '';
          const score = c.cgpa ? `${c.cgpa} / 10.0` : c.grade || c.position || 'Conferred';

          resultBox.innerHTML = `
            <div style="background: #F0FDF4; border: 1px solid #86EFAC; border-radius: 14px; padding: 18px; color: #166534;">
              <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid #BBF7D0; padding-bottom: 12px; margin-bottom: 12px;">
                <div style="display: flex; align-items: center; gap: 8px; font-weight: 800; font-size: 13px;">
                  ${svgCheck} <span>100% AUTHENTIC &amp; VERIFIED</span>
                </div>
                <span style="background: #DCFCE7; border: 1px solid #86EFAC; font-size: 10px; font-family: monospace; font-weight: 700; padding: 2px 8px; border-radius: 20px;">
                  ${data.institution?.algorithm ? data.institution.algorithm.toUpperCase() : 'ED25519'} ROOT KEY
                </span>
              </div>
              
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; font-size: 12px;">
                <div>
                  <span style="display: block; font-size: 10px; color: #15803D; font-weight: 700; text-transform: uppercase;">Candidate Name</span>
                  <strong style="color: #14532D; font-size: 13px;">${candidateName}</strong>
                </div>
                <div>
                  <span style="display: block; font-size: 10px; color: #15803D; font-weight: 700; text-transform: uppercase;">Roll / Registration No</span>
                  <strong style="color: #14532D; font-size: 13px;">${identifier}</strong>
                </div>
                <div style="grid-column: span 2;">
                  <span style="display: block; font-size: 10px; color: #15803D; font-weight: 700; text-transform: uppercase;">Credential Program / Distinction</span>
                  <span style="color: #14532D; font-weight: 600;">${credTitle}</span>
                </div>
                <div>
                  <span style="display: block; font-size: 10px; color: #15803D; font-weight: 700; text-transform: uppercase;">Grade / Score</span>
                  <strong style="color: #14532D; font-size: 13px;">${score}</strong>
                </div>
                <div>
                  <span style="display: block; font-size: 10px; color: #15803D; font-weight: 700; text-transform: uppercase;">Issue Date</span>
                  <span style="color: #14532D; font-family: monospace;">${c.issueDate ? c.issueDate.split('T')[0] : 'Official'}</span>
                </div>
              </div>

              <div style="margin-top: 14px; padding-top: 10px; border-top: 1px dashed #BBF7D0; font-size: 10px; font-family: monospace; color: #15803D; word-break: break-all;">
                SHA-256 Digest: ${data.dataHash || 'Verified on PKI Node'}
              </div>
            </div>
          `;
        }
      }

      function renderError(msg) {
        resultBox.style.display = 'block';
        resultBox.innerHTML = `
          <div style="background: #FEF2F2; border: 1px solid #FECACA; border-radius: 14px; padding: 14px; color: #991B1B; font-size: 12px; display: flex; align-items: center; gap: 8px;">
            ${svgAlert}
            <div><strong>Error:</strong> ${msg}</div>
          </div>
        `;
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCredifyWidget);
  } else {
    initCredifyWidget();
  }

  window.CredifyWidget = {
    init: initCredifyWidget,
  };
})(window, document);

