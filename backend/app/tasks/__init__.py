# Celery tasks are implemented in Sprint 5.
#
# Sprint 5 will add:
#   @celery_app.task(bind=True, max_retries=2)
#   def generate_blueprint(self, submission_id: str): ...
#
#   @celery_app.task(bind=True, max_retries=3)
#   def send_blueprint_email(self, submission_id: str, token: str): ...
