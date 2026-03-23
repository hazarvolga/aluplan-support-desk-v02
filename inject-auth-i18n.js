const fs = require('fs');
const path = require('path');

const basePath = path.join(__dirname, 'apps/frontend/messages');

const data = {
    tr: {
        auth: {
            register: {
                success_title: "Kayıt Başarılı!",
                success_desc: "Giriş detaylarınız e-posta adresinize gönderildi.",
                success_hint: "Lütfen e-postanızı kontrol edin ve sisteme giriş yapın.",
                back_to_login: "Giriş Ekranına Dön",
                title: "Kayıt Ol",
                subtitle: "Aluplan Destek Ekosistemine Katılın",
                email_label: "İş E-postanız",
                email_placeholder: "ornek@firma.com",
                continue_btn: "Devam Et",
                reset_sent_title: "Şifreniz Gönderildi",
                reset_sent_desc: "Yeni giriş şifreniz güvenlik amacıyla e-posta adresinize gönderildi. Lütfen gelen kutunuzu (ve gerekiyorsa spam klasörünü) kontrol edin.",
                recognized_title: "Sizi Tanıyoruz!",
                recognized_desc: "Aluplan sisteminde firmanız ve size ait bir profil zaten bulunuyor. <br /><br />Giriş yapabilir veya doğrudan yeni bir şifre talep edip e-posta ile alabilirsiniz.",
                login_btn: "Giriş Yap",
                reset_btn: "Şifremi Sıfırla",
                different_email: "Farklı bir e-posta dene",
                matched_company_prefix: "Sizi tanıdık!",
                matched_company_suffix: "ekibinin bir parçası olarak kaydınızı tamamlayın.",
                username_label: "Kullanıcı Adı",
                username_placeholder: "sisteme_giris_adi",
                firstname_label: "Ad",
                firstname_placeholder: "Adınız",
                lastname_label: "Soyad",
                lastname_placeholder: "Soyadınız",
                phone_label: "Telefon Numarası",
                phone_placeholder: "+90 (5xx) xxx xx xx",
                products_label: "Hangi Aluplan ürünlerini / modüllerini kullanıyorsunuz?",
                allplan_user_label: "Allplan / Aluplan kullanıcısıyım",
                allplan_user_desc: "Aluplan tarafından lisanslanmış bir Allplan kullanıcısıysanız, özel destek alabilmeniz için bunu işaretleyin.",
                company_label: "Firma",
                company_placeholder: "Firma adınız",
                customer_no_label: "Müşteri No",
                customer_no_placeholder: "Örn: C300 00 00 00",
                password_label: "Şifre",
                password_placeholder: "••••••",
                confirm_password_label: "Şifreyi Doğrula",
                back_btn: "Geri",
                submit_btn: "Kaydı Tamamla",
                already_have_account: "Zaten hesabınız var mı?",
                login_link: "Giriş Yapın",
                error_email_lookup: "E-posta kontrolü sırasında bir hata oluştu.",
                error_password_mismatch: "Şifreler eşleşmiyor.",
                error_customer_no: "Müşteri No formatı geçersiz. Örnek: C300 XX XX XX",
                error_register_failed: "Kayıt sırasında bir hata oluştu.",
                error_default: "Bir hata oluştu.",
                error_reset_failed: "Şifre sıfırlama sırasında bir hata oluştu."
            },
            reset_password: {
                new_password_label: "YENİ ŞİFRE",
                confirm_password_label: "ŞİFREYİ DOĞRULA",
                submit_btn: "ŞİFREYİ GÜNCELLE",
                title: "YENİ ŞİFRE BELİRLE",
                subtitle: "Güvenliğiniz için yeni bir şifre girin",
                error_invalid_link: "Geçersiz veya eksik sıfırlama bağlantısı.",
                error_missing_token: "Eksik token.",
                error_length: "Şifreniz en az 8 karakter olmalıdır.",
                error_mismatch: "Şifreler eşleşmiyor.",
                error_failed: "Şifre sıfırlama sırasında bir hata oluştu.",
                success_message: "Şifreniz başarıyla güncellendi."
            },
            verify_email: {
                loading_title: "Doğrulanıyor",
                default_loading: "E-posta adresiniz doğrulanıyor...",
                success_header: "Tebrikler!",
                default_success: "E-posta adresiniz başarıyla doğrulandı!",
                login_btn: "Giriş Yap",
                error_header: "Hata Oluştu",
                default_error_invalid: "Geçersiz doğrulama bağlantısı. Lütfen e-postanızdaki linke tekrar tıklayın.",
                default_error_failed: "Doğrulama işlemi başarısız oldu. Linkin süresi dolmuş olabilir.",
                support_btn: "Destek Al",
                home_btn: "Ana Sayfa",
                brand: "Aluplan Verification"
            }
        }
    },
    en: {
        auth: {
            register: {
                success_title: "Registration Successful!",
                success_desc: "Your login details have been sent to your email address.",
                success_hint: "Please check your email to log into the system.",
                back_to_login: "Back to Login",
                title: "Register",
                subtitle: "Join the Aluplan Support Ecosystem",
                email_label: "Work Email",
                email_placeholder: "example@company.com",
                continue_btn: "Continue",
                reset_sent_title: "Password Sent",
                reset_sent_desc: "Your new login password has been sent to your email address for security purposes. Please check your inbox (and spam folder if necessary).",
                recognized_title: "We Recognize You!",
                recognized_desc: "We already have a profile for you and your company in the Aluplan system. <br /><br />You can log in or directly request a new password to be sent to your email.",
                login_btn: "Log In",
                reset_btn: "Reset Password",
                different_email: "Try a different email",
                matched_company_prefix: "We recognized you!",
                matched_company_suffix: "complete your registration as part of their team.",
                username_label: "Username",
                username_placeholder: "system_login_id",
                firstname_label: "First Name",
                firstname_placeholder: "Your Name",
                lastname_label: "Last Name",
                lastname_placeholder: "Your Last Name",
                phone_label: "Phone Number",
                phone_placeholder: "+90 (5xx) xxx xx xx",
                products_label: "Which Aluplan products / modules do you use?",
                allplan_user_label: "I am an Allplan / Aluplan User",
                allplan_user_desc: "If you are an Allplan user licensed by Aluplan, please check this to receive specialized support.",
                company_label: "Company",
                company_placeholder: "Your Company Name",
                customer_no_label: "Customer No",
                customer_no_placeholder: "E.g. C300 00 00 00",
                password_label: "Password",
                password_placeholder: "••••••",
                confirm_password_label: "Confirm Password",
                back_btn: "Back",
                submit_btn: "Complete Registration",
                already_have_account: "Already have an account?",
                login_link: "Sign In",
                error_email_lookup: "An error occurred during email verification.",
                error_password_mismatch: "Passwords do not match.",
                error_customer_no: "Invalid Customer No format. Example: C300 XX XX XX",
                error_register_failed: "An error occurred during registration.",
                error_default: "An error occurred.",
                error_reset_failed: "An error occurred during password reset."
            },
            reset_password: {
                new_password_label: "NEW PASSWORD",
                confirm_password_label: "CONFIRM PASSWORD",
                submit_btn: "UPDATE PASSWORD",
                title: "SET NEW PASSWORD",
                subtitle: "Enter a new password for your security",
                error_invalid_link: "Invalid or missing reset link.",
                error_missing_token: "Missing token.",
                error_length: "Your password must be at least 8 characters long.",
                error_mismatch: "Passwords do not match.",
                error_failed: "An error occurred during password reset.",
                success_message: "Your password was successfully updated."
            },
            verify_email: {
                loading_title: "Verifying",
                default_loading: "Verifying your email address...",
                success_header: "Congratulations!",
                default_success: "Your email address has been successfully verified!",
                login_btn: "Sign In",
                error_header: "Error Occurred",
                default_error_invalid: "Invalid verification link. Please click the link in your email again.",
                default_error_failed: "Verification process failed. The link may have expired.",
                support_btn: "Get Support",
                home_btn: "Homepage",
                brand: "Aluplan Verification"
            }
        }
    },
    de: {
        auth: {
            register: {
                success_title: "Registrierung erfolgreich!",
                success_desc: "Ihre Anmeldedaten wurden an Ihre E-Mail-Adresse gesendet.",
                success_hint: "Bitte überprüfen Sie Ihre E-Mail, um sich in das System einzuloggen.",
                back_to_login: "Zurück zur Anmeldung",
                title: "Registrieren",
                subtitle: "Treten Sie dem Aluplan Support-Ökosystem bei",
                email_label: "Geschäftliche E-Mail",
                email_placeholder: "beispiel@firma.com",
                continue_btn: "Weiter",
                reset_sent_title: "Passwort gesendet",
                reset_sent_desc: "Ihr neues Anmeldepasswort wurde aus Sicherheitsgründen an Ihre E-Mail-Adresse gesendet. Bitte überprüfen Sie Ihren Posteingang (und falls nötig, den Spam-Ordner).",
                recognized_title: "Wir kennen Sie bereits!",
                recognized_desc: "Wir haben bereits ein Profil für Sie und Ihr Unternehmen im Aluplan-System. <br /><br />Sie können sich anmelden oder direkt ein neues Passwort anfordern, das per E-Mail verschickt wird.",
                login_btn: "Anmelden",
                reset_btn: "Passwort zurücksetzen",
                different_email: "Eine andere E-Mail ausprobieren",
                matched_company_prefix: "Wir haben Sie erkannt!",
                matched_company_suffix: "schließen Sie Ihre Registrierung als Teil ihres Teams ab.",
                username_label: "Benutzername",
                username_placeholder: "system_login_id",
                firstname_label: "Vorname",
                firstname_placeholder: "Ihr Name",
                lastname_label: "Nachname",
                lastname_placeholder: "Ihr Nachname",
                phone_label: "Telefonnummer",
                phone_placeholder: "+90 (5xx) xxx xx xx",
                products_label: "Welche Aluplan Produkte / Module verwenden Sie?",
                allplan_user_label: "Ich bin Allplan / Aluplan-Nutzer",
                allplan_user_desc: "Wenn Sie ein von Aluplan lizenzierter Allplan-Nutzer sind, haken Sie dieses Kästchen ab, um spezialisierten Support zu erhalten.",
                company_label: "Unternehmen",
                company_placeholder: "Ihr Unternehmensname",
                customer_no_label: "Kundennummer",
                customer_no_placeholder: "z.B. C300 00 00 00",
                password_label: "Passwort",
                password_placeholder: "••••••",
                confirm_password_label: "Passwort bestätigen",
                back_btn: "Zurück",
                submit_btn: "Registrierung abschließen",
                already_have_account: "Haben Sie bereits ein Konto?",
                login_link: "Anmelden",
                error_email_lookup: "Bei der E-Mail-Überprüfung ist ein Fehler aufgetreten.",
                error_password_mismatch: "Passwörter stimmen nicht überein.",
                error_customer_no: "Ungültiges Kundennummernformat. Beispiel: C300 XX XX XX",
                error_register_failed: "Bei der Registrierung ist ein Fehler aufgetreten.",
                error_default: "Ein Fehler ist aufgetreten.",
                error_reset_failed: "Beim Zurücksetzen des Passworts ist ein Fehler aufgetreten."
            },
            reset_password: {
                new_password_label: "NEUES PASSWORT",
                confirm_password_label: "PASSWORT BESTÄTIGEN",
                submit_btn: "PASSWORT AKTUALISIEREN",
                title: "NEUES PASSWORT FESTLEGEN",
                subtitle: "Legen Sie zu Ihrer Sicherheit ein neues Passwort fest",
                error_invalid_link: "Ungültiger oder fehlender Link zum Zurücksetzen.",
                error_missing_token: "Fehlendes Token.",
                error_length: "Ihr Passwort muss mindestens 8 Zeichen lang sein.",
                error_mismatch: "Passwörter stimmen nicht überein.",
                error_failed: "Beim Zurücksetzen des Passworts ist ein Fehler aufgetreten.",
                success_message: "Ihr Passwort wurde erfolgreich aktualisiert."
            },
            verify_email: {
                loading_title: "Wird überprüft",
                default_loading: "Ihre E-Mail-Adresse wird überprüft...",
                success_header: "Herzlichen Glückwunsch!",
                default_success: "Ihre E-Mail-Adresse wurde erfolgreich verifiziert!",
                login_btn: "Anmelden",
                error_header: "Fehler aufgetreten",
                default_error_invalid: "Ungültiger Verifizierungslink. Bitte klicken Sie erneut auf den Link in Ihrer E-Mail.",
                default_error_failed: "Überprüfung fehlgeschlagen. Der Link ist möglicherweise abgelaufen.",
                support_btn: "Unterstützung erhalten",
                home_btn: "Startseite",
                brand: "Aluplan Verification"
            }
        }
    }
};

function deepMerge(target, source) {
    for (const key in source) {
        if (typeof source[key] === 'object' && source[key] !== null && !Array.isArray(source[key])) {
            if (!target[key]) target[key] = {};
            deepMerge(target[key], source[key]);
        } else {
            target[key] = source[key];
        }
    }
    return target;
}

['tr', 'en', 'de'].forEach(loc => {
    const filePath = path.join(basePath, `${loc}.json`);
    const fileContent = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

    deepMerge(fileContent, data[loc]);

    fs.writeFileSync(filePath, JSON.stringify(fileContent, null, 2));
    console.log(`Updated ${loc}.json`);
});
