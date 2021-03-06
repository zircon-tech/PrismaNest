import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, HttpStatus } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { JwtAuthGuard } from '../src/guards/jwt-auth.guard';
import { PostModule } from '../src/modules/posts/post.module';
import { PostService } from '../src/modules/posts/post.service';

describe('AppController (e2e)', () => {
  let app: INestApplication;
  let authToken: JwtAuthGuard;
  let postService = { posts: () => [
    {
    "id": 19,
    "title": "title",
    "content": "content",
    "published": true,
    "owner": 1
    }
  ] };

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule, PostModule],
    })
    .overrideProvider(PostService)
    .useValue(postService)
    .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });


  describe('Authentication', () => {
    let jwtToken: string

    describe('AuthModule', () => {
      // assume test data includes user test@example.com with password 'password'
      it('authenticates user with valid credentials and provides a jwt token', async () => {
        const response = await request(app.getHttpServer())
          .post('/auth/login')
          .send(  {username: 'matucasal', password: 'pepePEPE123!'} )
          .expect(201)

        // set jwt token for use in subsequent tests
        jwtToken = response.body.access_token
        expect(jwtToken).toMatch(/^[A-Za-z0-9-_=]+\.[A-Za-z0-9-_=]+\.?[A-Za-z0-9-_.+/=]*$/) // jwt regex
      })

      
    })

    describe('Protected', () => {
      it('gets protected resource with jwt authenticated request', async () => {
        const response = await request(app.getHttpServer())
          .get('/profile')
          .set('Authorization', `Bearer ${jwtToken}`)
          .expect(200)

        const data = response.body.data
        // add assertions that reflect your test data
        // expect(data).toHaveLength(3) 
      })

      it(`/Feed posts`, async () => {
        const response = await request(app.getHttpServer())
          .get('/feed')
          .set('Authorization', `Bearer ${jwtToken}`)
          .expect(200)
          .expect(postService.posts());

          const data = response.body.data
      });
    })
  })

});