'use strict';
/* LOGIN, SIGN UP and FORGOT PASSWORD popup.
   Sign up includes Full Name, Date of Birth, Email with verification code,
   Country Code + Phone Number, Phone Verification Code, and Password with eye toggle and strong validation. */

function auth(tab){
  if (tab === 'signup') {
    modal(`
      <div class="auth">
        <div class="aside" style="background-image:${pic('beach',5,700,900)}">
          <div class="brand light">
            <img class="logo" width="40" height="40" src="assets/logo/yatripath-logo.png" alt="YatriPath logo">
            <span class="bn"><b>Yatri<i>Path</i></b></span>
          </div>
          <div>
            <h2>Your next journey starts here</h2>
            <p>Bus, train and flight bookings in one place.</p>
          </div>
        </div>
        <div class="aform">
          <h3>Create your account</h3>
          <p class="sub">Fill in your details to start booking trips.</p>
          <form id="af" novalidate>
            <!-- 1. Full Name -->
            <div class="f">
              <label for="su_name"><span>${ic('user')} Full Name <span class="req">*</span></span></label>
              <input id="su_name" type="text" required placeholder="e.g. Rahul Sharma" autocomplete="name">
            </div>

            <!-- 2. Date of Birth -->
            <div class="f">
              <label for="su_dob"><span>${ic('calendar')} Date of Birth <span class="req">*</span></span></label>
              <input id="su_dob" type="date" required max="${day()}" autocomplete="bday">
            </div>

            <!-- 3. Email Address -->
            <div class="f">
              <label for="su_email"><span>${ic('mail')} Email Address <span class="req">*</span></span></label>
              <div class="input-with-btn">
                <input id="su_email" type="email" required placeholder="you@example.com" autocomplete="email">
                <button type="button" class="btn sm" id="su_send_code_btn">Send Code</button>
              </div>
              <small class="field-hint" id="su_email_hint"></small>
            </div>

            <!-- 4. Email Verification Code -->
            <div class="f" id="su_code_container">
              <label for="su_code">
                <span>${ic('check')} Email Verification Code <span class="req">*</span></span>
                <span class="v-badge" id="su_verify_badge" style="display:none"></span>
              </label>
              <div class="input-with-btn">
                <input id="su_code" type="text" maxlength="6" placeholder="Enter verification code" autocomplete="one-time-code">
                <button type="button" class="btn ghost sm" id="su_verify_btn">Verify Code</button>
              </div>
              <small class="field-hint" id="su_code_feedback"></small>
            </div>

            <!-- 5. Country Code + Phone Number -->
            <div class="f">
              <label for="su_phone"><span>${ic('phone')} Phone Number <span class="req">*</span></span></label>
              <div class="input-with-btn">
                <div class="phone-group">
                  <select id="su_country_code" aria-label="Country calling code">
                    <option value="+91" selected>+91 India</option>
                    <option value="+1">+1 USA / Canada</option>
                    <option value="+44">+44 UK</option>
                    <option value="+971">+971 UAE</option>
                    <option value="+65">+65 Singapore</option>
                    <option value="+880">+880 Bangladesh</option>
                    <option value="+977">+977 Nepal</option>
                    <option value="+94">+94 Sri Lanka</option>
                    <option value="+61">+61 Australia</option>
                    <option value="+49">+49 Germany</option>
                    <option value="+33">+33 France</option>
                    <option value="+81">+81 Japan</option>
                    <option value="+86">+86 China</option>
                    <option value="+966">+966 Saudi Arabia</option>
                    <option value="+60">+60 Malaysia</option>
                    <option value="+66">+66 Thailand</option>
                    <option value="+62">+62 Indonesia</option>
                    <option value="+39">+39 Italy</option>
                    <option value="+34">+34 Spain</option>
                    <option value="+7">+7 Russia</option>
                    <option value="+27">+27 South Africa</option>
                  </select>
                  <input id="su_phone" type="tel" required placeholder="Enter mobile number" pattern="[0-9]{7,15}" autocomplete="tel-national">
                </div>
                <button type="button" class="btn sm" id="su_phone_send_btn">Send Code</button>
              </div>
              <small class="field-hint" id="su_phone_hint"></small>
            </div>

            <!-- 6. Phone Verification Code -->
            <div class="f" id="su_phone_code_container">
              <label for="su_phone_code">
                <span>${ic('check')} Phone Verification Code <span class="req">*</span></span>
                <span class="v-badge" id="su_phone_verify_badge" style="display:none"></span>
              </label>
              <div class="input-with-btn">
                <input id="su_phone_code" type="text" maxlength="6" placeholder="Enter verification code" autocomplete="one-time-code">
                <button type="button" class="btn ghost sm" id="su_phone_verify_btn">Verify Code</button>
              </div>
              <small class="field-hint" id="su_phone_code_feedback"></small>
            </div>

            <!-- 7. Create Password -->
            <div class="f">
              <label for="su_pass"><span>${ic('lock')} Create Password <span class="req">*</span></span></label>
              <div class="pw-group">
                <input id="su_pass" type="password" required minlength="8" placeholder="Enter a secure password" autocomplete="new-password">
                <button type="button" class="pw-toggle" id="su_pw_toggle" aria-label="Show password">
                  <svg class="eye-icon" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                    <circle cx="12" cy="12" r="3"/>
                  </svg>
                </button>
              </div>
              <small class="field-hint">At least 8 characters, including letters, numbers, and a special character.</small>
            </div>

            <!-- Submit Button -->
            <button class="btn" type="submit" id="su_submit" style="width:100%;padding:13px;margin-top:6px">Create Account</button>
          </form>
          <p class="sw">Already registered? <a href="#" data-au="login">Login</a></p>
        </div>
      </div>
    `, 'wide');

    // Attach Signup Event Listeners
    let isEmailVerified = false;
    let emailCodeSent = false;
    let isPhoneVerified = false;
    let phoneCodeSent = false;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    // Eye Icons (open and slashed)
    const EYE_OPEN = '<svg class="eye-icon" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>';
    const EYE_OFF = '<svg class="eye-icon" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>';

    // Show/Hide password toggle with eye icon
    const pwToggle = $('#su_pw_toggle');
    if (pwToggle) {
      pwToggle.onclick = () => {
        const inp = $('#su_pass');
        const isPw = inp.type === 'password';
        inp.type = isPw ? 'text' : 'password';
        pwToggle.innerHTML = isPw ? EYE_OFF : EYE_OPEN;
        pwToggle.setAttribute('aria-label', isPw ? 'Hide password' : 'Show password');
      };
    }

    // Reset email verification if email changes
    $('#su_email').oninput = () => {
      $('#su_email').classList.remove('bad');
      $('#su_email_hint').innerHTML = '';
      if (isEmailVerified) {
        isEmailVerified = false;
        emailCodeSent = false;
        $('#su_verify_badge').style.display = 'none';
        $('#su_code').disabled = false;
        $('#su_code').value = '';
        $('#su_verify_btn').disabled = false;
        $('#su_send_code_btn').disabled = false;
        $('#su_send_code_btn').textContent = 'Send Code';
        $('#su_code_feedback').innerHTML = '';
      }
    };

    // Send email verification code button
    const sendBtn = $('#su_send_code_btn');
    if (sendBtn) {
      sendBtn.onclick = () => {
        const emailInput = $('#su_email');
        const email = emailInput.value.trim();
        if (!email || !emailRegex.test(email)) {
          emailInput.classList.add('bad');
          $('#su_email_hint').innerHTML = '<span style="color:var(--er)">Please enter a valid email address first.</span>';
          emailInput.focus();
          toast('Please enter a valid email address first.', 'er');
          return;
        }
        emailInput.classList.remove('bad');
        $('#su_email_hint').innerHTML = '';
        emailCodeSent = true;
        sendBtn.textContent = 'Resend Code';
        toast('Verification code sent to ' + email, 'ok');
        $('#su_code_feedback').innerHTML = '<span style="color:var(--mu)">Verification code sent. Please check your inbox.</span>';
        $('#su_code').focus();
      };
    }

    // Verify email verification code button
    const verifyBtn = $('#su_verify_btn');
    if (verifyBtn) {
      verifyBtn.onclick = () => {
        const code = $('#su_code').value.trim();
        if (!emailCodeSent) {
          toast("Please click 'Send Code' first to request a verification code.", 'er');
          $('#su_send_code_btn').focus();
          return;
        }
        if (!code) {
          $('#su_code').classList.add('bad');
          toast('Please enter the verification code.', 'er');
          $('#su_code').focus();
          return;
        }

        // Complete front-end verification
        isEmailVerified = true;
        $('#su_code').classList.remove('bad');
        $('#su_verify_badge').innerHTML = '<span class="badge-ok">✓ Verified</span>';
        $('#su_verify_badge').style.display = 'inline-block';
        $('#su_code_feedback').innerHTML = '<span style="color:var(--ok);font-weight:600">✓ Email address verified successfully.</span>';
        $('#su_code').disabled = true;
        verifyBtn.disabled = true;
        sendBtn.disabled = true;
        $('#su_email').readOnly = true;
        toast('Email verified successfully!', 'ok');
      };
    }

    // Reset phone verification if phone changes
    $('#su_phone').oninput = () => {
      $('#su_phone').classList.remove('bad');
      $('#su_phone_hint').innerHTML = '';
      if (isPhoneVerified) {
        isPhoneVerified = false;
        phoneCodeSent = false;
        $('#su_phone_verify_badge').style.display = 'none';
        $('#su_phone_code').disabled = false;
        $('#su_phone_code').value = '';
        $('#su_phone_verify_btn').disabled = false;
        $('#su_phone_send_btn').disabled = false;
        $('#su_phone_send_btn').textContent = 'Send Code';
        $('#su_phone_code_feedback').innerHTML = '';
      }
    };

    // Send phone verification code button
    const phoneSendBtn = $('#su_phone_send_btn');
    if (phoneSendBtn) {
      phoneSendBtn.onclick = () => {
        const phone = $('#su_phone').value.trim();
        if (!phone || !/^[0-9]{7,15}$/.test(phone)) {
          $('#su_phone').classList.add('bad');
          $('#su_phone_hint').innerHTML = '<span style="color:var(--er)">Please enter a valid mobile number first (7-15 digits).</span>';
          $('#su_phone').focus();
          toast('Please enter a valid mobile number first.', 'er');
          return;
        }
        $('#su_phone').classList.remove('bad');
        $('#su_phone_hint').innerHTML = '';
        phoneCodeSent = true;
        phoneSendBtn.textContent = 'Resend Code';
        const cc = $('#su_country_code').value;
        toast('Verification code sent to ' + cc + ' ' + phone, 'ok');
        $('#su_phone_code_feedback').innerHTML = '<span style="color:var(--mu)">Verification code sent via SMS. Please check your messages.</span>';
        $('#su_phone_code').focus();
      };
    }

    // Verify phone verification code button
    const phoneVerifyBtn = $('#su_phone_verify_btn');
    if (phoneVerifyBtn) {
      phoneVerifyBtn.onclick = () => {
        const code = $('#su_phone_code').value.trim();
        if (!phoneCodeSent) {
          toast("Please click 'Send Code' first to request a phone verification code.", 'er');
          phoneSendBtn.focus();
          return;
        }
        if (!code) {
          $('#su_phone_code').classList.add('bad');
          toast('Please enter the phone verification code.', 'er');
          $('#su_phone_code').focus();
          return;
        }

        // Complete front-end verification
        isPhoneVerified = true;
        $('#su_phone_code').classList.remove('bad');
        $('#su_phone_verify_badge').innerHTML = '<span class="badge-ok">✓ Verified</span>';
        $('#su_phone_verify_badge').style.display = 'inline-block';
        $('#su_phone_code_feedback').innerHTML = '<span style="color:var(--ok);font-weight:600">✓ Phone number verified successfully.</span>';
        $('#su_phone_code').disabled = true;
        phoneVerifyBtn.disabled = true;
        phoneSendBtn.disabled = true;
        $('#su_phone').readOnly = true;
        $('#su_country_code').disabled = true;
        toast('Phone number verified successfully!', 'ok');
      };
    }

    // Form submission validation
    $('#af').onsubmit = e => {
      e.preventDefault();
      const name = $('#su_name').value.trim();
      const dob = $('#su_dob').value;
      const email = $('#su_email').value.trim();
      const countryCode = $('#su_country_code').value;
      const phone = $('#su_phone').value.trim();
      const pass = $('#su_pass').value;

      if (!name) {
        toast('Please enter your full name.', 'er');
        $('#su_name').focus();
        return;
      }
      if (!dob) {
        toast('Please select your date of birth.', 'er');
        $('#su_dob').focus();
        return;
      }
      if (!email || !emailRegex.test(email)) {
        toast('Please enter a valid email address.', 'er');
        $('#su_email').focus();
        return;
      }
      if (!isEmailVerified) {
        toast('Please verify your email address before creating your account.', 'er');
        if (!emailCodeSent) {
          $('#su_send_code_btn').focus();
        } else {
          $('#su_code').focus();
        }
        return;
      }
      if (!phone || !/^[0-9]{7,15}$/.test(phone)) {
        toast('Please enter a valid mobile number (7-15 digits).', 'er');
        $('#su_phone').focus();
        return;
      }
      if (!isPhoneVerified) {
        toast('Please verify your phone number before creating your account.', 'er');
        if (!phoneCodeSent) {
          $('#su_phone_send_btn').focus();
        } else {
          $('#su_phone_code').focus();
        }
        return;
      }

      const hasLetters = /[A-Za-z]/.test(pass);
      const hasNumbers = /[0-9]/.test(pass);
      const hasSpecial = /[^A-Za-z0-9]/.test(pass);
      if (pass.length < 8 || !hasLetters || !hasNumbers || !hasSpecial) {
        toast('Password must be at least 8 characters and include letters, numbers, and a special character.', 'er');
        $('#su_pass').focus();
        return;
      }

      // Save to profile in localStorage
      const cur = prof();
      ls.s('profile', {
        name: name,
        dob: dob,
        email: email,
        phone: `${countryCode} ${phone}`,
        city: cur.city || 'Kolkata'
      });
      closeM();
      toast('Account created successfully! Welcome to YatriPath.', 'ok');
      if (S.view === 'profile') profile();
    };

    return;
  }

  // Handle Login and Forgot Password
  const L = {
    login: [
      'Welcome back',
      'Log in to manage your trips.',
      'Login',
      `<div class="f"><label for="a1"><span>${ic('mail')} Email</span></label><input id="a1" type="email" required placeholder="you@example.com"></div><div class="f"><label for="a2"><span>${ic('lock')} Password</span></label><input id="a2" type="password" required placeholder="Enter your password"></div><p class="sw"><a href="#" data-au="forgot">Forgot password?</a></p>`,
      'New to YatriPath? <a href="#" data-au="signup">Create an account</a>'
    ],
    forgot: [
      'Reset your password',
      'Enter your email and we will send a reset link.',
      'Send reset link',
      `<div class="f"><label for="a1"><span>${ic('mail')} Registered email</span></label><input id="a1" type="email" required></div>`,
      '<a href="#" data-au="login">Back to login</a>'
    ]
  }[tab];

  if (!L) return;

  modal(`
    <div class="auth">
      <div class="aside" style="background-image:${pic({login:'lake',forgot:'road'}[tab],5,700,900)}">
        <div class="brand light">
          <img class="logo" width="40" height="40" src="assets/logo/yatripath-logo.png" alt="YatriPath logo">
          <span class="bn"><b>Yatri<i>Path</i></b></span>
        </div>
        <div>
          <h2>Your next journey starts here</h2>
          <p>Bus, train and flight bookings in one place.</p>
        </div>
      </div>
      <div class="aform">
        <h3>${L[0]}</h3>
        <p class="sub">${L[1]}</p>
        <form id="af">${L[3]}<button class="btn" style="width:100%;padding:13px">${L[2]}</button></form>
        <p class="sw">${L[4]}</p>
      </div>
    </div>
  `, 'wide');

  $('#af').onsubmit = e => {
    e.preventDefault();
    closeM();
    toast(tab === 'forgot' ? 'Reset link sent to your email.' : 'Welcome back to YatriPath!', 'ok');
  };
}
