from flask import Flask, render_template, send_from_directory, jsonify, request
import os
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import ssl

# Load environment variables
try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass  # python-dotenv not installed, will use system environment variables

app = Flask(__name__,
            static_folder='.',
            template_folder='.')

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/static/<path:filename>')
def static_files(filename):
    return send_from_directory('.', filename)

@app.route('/favicon.ico')
def favicon():
    # Return a simple favicon response
    return '', 204

@app.route('/api/features')
def get_features():
    features = [
        {
            'icon': '🔗',
            'title': 'Unified Caching Layer',
            'description': 'Seamlessly integrates database caching with LLM KV caching in a single, cohesive system'
        },
        {
            'icon': '🗄️',
            'title': 'Database Service Integration',
            'description': 'Optimized caching for various database engines including SQL, NoSQL, and time-series databases'
        },
        {
            'icon': '🤖',
            'title': 'LLM KV Cache',
            'description': 'Dedicated key-value caching optimized for Large Language Model inference and training'
        },
        {
            'icon': '⚡',
            'title': 'Query Optimization',
            'description': 'Intelligent query planning and execution optimization for each connected engine'
        },
        {
            'icon': '📊',
            'title': 'Real-time Analytics',
            'description': 'Comprehensive monitoring and analytics dashboard for cache performance and hit rates'
        },
        {
            'icon': '🔒',
            'title': 'Enterprise Security',
            'description': 'Built-in encryption, access controls, and compliance features for enterprise deployments'
        }
    ]
    return jsonify(features)

@app.route('/api/performance')
def get_performance():
    performance_data = {
        'query_response': '5x',
        'cache_hit_rate': '90%',
        'latency_reduction': '50%',
        'data_processed': '10TB+'
    }
    return jsonify(performance_data)

def send_email(name, email, company, message):
    """Send email using Gmail SMTP"""
    # Email configuration
    sender_email = "universalcachetune@gmail.com"

    sender_password = os.environ.get('senderPassword')  # Get from environment variable
    receiver_email = "universalcachetune@gmail.com"

    # Create message
    msg = MIMEMultipart()
    msg['From'] = sender_email
    msg['To'] = receiver_email
    msg['Subject'] = f"New Contact Form Submission from {name}"

    # Email body
    body = f"""
    New contact form submission from the Unified Cache Optimizer website:

    Name: {name}
    Email: {email}
    Company: {company or 'Not provided'}

    Message:
    {message}

    ---
    This email was sent from the contact form on the Unified Cache Optimizer website.
    """

    msg.attach(MIMEText(body, 'plain'))

    try:
        # Create secure connection with server and send email
        context = ssl.create_default_context()
        with smtplib.SMTP_SSL("smtp.gmail.com", 465, context=context) as server:
            server.login(sender_email, sender_password)
            server.sendmail(sender_email, receiver_email, msg.as_string())

        return True, "Email sent successfully!"
    except Exception as e:
        print(f"Email sending failed: {str(e)}")
        return False, f"Failed to send email: {str(e)}"

@app.route('/api/contact', methods=['POST'])
def handle_contact():
    try:
        # Get form data
        data = request.get_json() or request.form

        name = data.get('name', '').strip()
        email = data.get('email', '').strip()
        company = data.get('company', '').strip()
        message = data.get('message', '').strip()

        # Validate required fields
        if not name or not email or not message:
            return jsonify({
                'success': False,
                'message': 'Please fill in all required fields (Name, Email, Message).'
            }), 400

        # Basic email validation
        if '@' not in email or '.' not in email:
            return jsonify({
                'success': False,
                'message': 'Please enter a valid email address.'
            }), 400

        # Send email
        success, email_message = send_email(name, email, company, message)

        if success:
            return jsonify({
                'success': True,
                'message': 'Thank you for your message! We will get back to you within 24 hours.'
            })
        else:
            return jsonify({
                'success': False,
                'message': 'Sorry, there was an error sending your message. Please try again later.'
            }), 500

    except Exception as e:
        print(f"Contact form error: {str(e)}")
        return jsonify({
            'success': False,
            'message': 'An unexpected error occurred. Please try again later.'
        }), 500

def send_newsletter_email(email):
    """Send newsletter subscription email"""
    # Email configuration
    sender_email = "universalcachetune@gmail.com"
    sender_password = os.environ.get('senderPassword')  # Get from environment variable
    receiver_email = "universalcachetune@gmail.com"

    # Create message
    msg = MIMEMultipart()
    msg['From'] = sender_email
    msg['To'] = receiver_email
    msg['Subject'] = f"New Newsletter Subscription - Unified Cache Optimizer"

    # Email body
    body = f"""
    New newsletter subscription for Unified Cache Optimizer:

    Email: {email}

    ---
    This email was sent from the newsletter subscription form on the Unified Cache Optimizer website.
    """

    msg.attach(MIMEText(body, 'plain'))

    try:
        # Create secure connection with server and send email
        context = ssl.create_default_context()
        with smtplib.SMTP_SSL("smtp.gmail.com", 465, context=context) as server:
            server.login(sender_email, sender_password)
            server.sendmail(sender_email, receiver_email, msg.as_string())

        return True, "Email sent successfully!"
    except Exception as e:
        print(f"Newsletter email sending failed: {str(e)}")
        return False, f"Failed to send email: {str(e)}"

@app.route('/api/newsletter', methods=['POST'])
def handle_newsletter():
    try:
        data = request.get_json() or request.form
        email = data.get('email', '').strip()

        # Validate email
        if not email or '@' not in email or '.' not in email:
            return jsonify({
                'success': False,
                'message': 'Please enter a valid email address.'
            }), 400

        # Send newsletter subscription email
        success, email_message = send_newsletter_email(email)

        if success:
            return jsonify({
                'success': True,
                'message': 'Thank you for subscribing! You will receive updates about our beta program and new features.'
            })
        else:
            return jsonify({
                'success': False,
                'message': 'Sorry, there was an error processing your subscription. Please try again later.'
            }), 500

    except Exception as e:
        print(f"Newsletter error: {str(e)}")
        return jsonify({
            'success': False,
            'message': 'An error occurred. Please try again later.'
        }), 500

@app.route('/health')
def health_check():
    return jsonify({'status': 'healthy', 'service': 'Unified Cache Optimizer'})

if __name__ == '__main__':
    app.run()
